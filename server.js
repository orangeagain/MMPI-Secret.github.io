"use strict";

const http = require("node:http");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { mkdir, readFile, rename, stat, writeFile } = require("node:fs/promises");
const { createRecord, renderMarkdown } = require("./origin_js/result_report.js");

const projectRoot = __dirname;
const resultsRoot = path.join(projectRoot, "storage", "results");
const host = "127.0.0.1";
const configuredPort = Number.parseInt(process.env.MMPI_PORT || "8765", 10);
const port = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort < 65536
  ? configuredPort
  : 8765;
const maxBodyBytes = 5 * 1024 * 1024;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function sendJson(response, statusCode, value) {
  const body = JSON.stringify(value, null, 2) + "\n";
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let receivedBytes = 0;

    request.on("data", (chunk) => {
      receivedBytes += chunk.length;
      if (receivedBytes > maxBodyBytes) {
        reject(Object.assign(new Error("请求内容超过5 MB限制"), { statusCode: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(text));
      } catch (error) {
        reject(Object.assign(new Error("请求不是有效的JSON"), { statusCode: 400 }));
      }
    });

    request.on("error", reject);
  });
}

function validateResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw Object.assign(new Error("测试结果格式错误"), { statusCode: 400 });
  }
  if (result.schemaVersion !== 1) {
    throw Object.assign(new Error("不支持的测试结果版本"), { statusCode: 400 });
  }
  if (!result.test || !Array.isArray(result.answers) || !Array.isArray(result.scales)) {
    throw Object.assign(new Error("测试结果缺少必要字段"), { statusCode: 400 });
  }
  if (result.answers.length > 567 || result.scales.length > 200) {
    throw Object.assign(new Error("测试结果条目数量异常"), { statusCode: 400 });
  }
}

async function saveResult(result) {
  validateResult(result);

  const record = createRecord(result, randomUUID().slice(0, 8));
  const id = record.id;
  const dateDirectory = record.savedAtLocal.slice(0, 10);
  const destinationDirectory = path.join(resultsRoot, dateDirectory);
  const jsonName = `${id}.json`;
  const markdownName = `${id}.md`;
  const jsonPath = path.join(destinationDirectory, jsonName);
  const markdownPath = path.join(destinationDirectory, markdownName);

  await mkdir(destinationDirectory, { recursive: true });
  const tempSuffix = `.tmp-${process.pid}-${randomUUID()}`;
  const tempJsonPath = jsonPath + tempSuffix;
  const tempMarkdownPath = markdownPath + tempSuffix;
  await writeFile(tempJsonPath, JSON.stringify(record, null, 2) + "\n", "utf8");
  await writeFile(tempMarkdownPath, renderMarkdown(record), "utf8");
  await rename(tempJsonPath, jsonPath);
  await rename(tempMarkdownPath, markdownPath);

  return {
    id,
    directory: path.relative(projectRoot, destinationDirectory).replace(/\\/g, "/"),
    jsonFile: jsonName,
    markdownFile: markdownName,
    savedAt: record.savedAt,
    savedAtLocal: record.savedAtLocal
  };
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestedPath);
  } catch (_error) {
    sendJson(response, 400, { ok: false, error: "URL编码无效" });
    return;
  }

  const normalizedWebPath = decodedPath.replace(/\\/g, "/");
  const isPrivatePath =
    normalizedWebPath === "/storage" ||
    normalizedWebPath.startsWith("/storage/") ||
    normalizedWebPath === "/.git" ||
    normalizedWebPath.startsWith("/.git/");

  if (isPrivatePath) {
    sendJson(response, 403, { ok: false, error: "该路径不能通过网页访问" });
    return;
  }

  const filePath = path.resolve(projectRoot, "." + decodedPath);
  if (filePath !== projectRoot && !filePath.startsWith(projectRoot + path.sep)) {
    sendJson(response, 403, { ok: false, error: "禁止访问该路径" });
    return;
  }

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      sendJson(response, 404, { ok: false, error: "文件不存在" });
      return;
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "X-Content-Type-Options": "nosniff"
    });
    if (request.method === "HEAD") {
      response.end();
    } else {
      response.end(body);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      sendJson(response, 404, { ok: false, error: "文件不存在" });
    } else {
      console.error(error);
      sendJson(response, 500, { ok: false, error: "读取文件失败" });
    }
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  if (request.method === "POST" && requestUrl.pathname === "/api/results") {
    try {
      const result = await readJsonBody(request);
      const saved = await saveResult(result);
      sendJson(response, 201, { ok: true, ...saved });
    } catch (error) {
      if (!response.headersSent) {
        sendJson(response, error.statusCode || 500, { ok: false, error: error.message || "保存失败" });
      }
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { ok: false, error: "不支持的请求方法" });
    return;
  }

  await serveStatic(request, response, requestUrl.pathname);
});

server.listen(port, host, async () => {
  await mkdir(resultsRoot, { recursive: true });
  console.log(`MMPI 本地服务已启动：http://${host}:${port}/MMPI-1-test.html`);
  console.log(`测试结果目录：${resultsRoot}`);
});
