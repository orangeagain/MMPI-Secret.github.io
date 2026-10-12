// 测试结果记录与 Markdown 报告生成。
//
// 本文件同时被浏览器页面（<script> 引入）和本地 Node 服务器（require）使用，
// 这样在线静态版（GitHub Pages）与本地服务器版导出的报告格式完全一致。
(function(root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MmpiResultReport = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  function hongKongDateParts(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  // 为一次测试结果补上记录编号与保存时间。randomSuffix 由调用方提供（8位随机串）。
  function createRecord(result, randomSuffix, now) {
    const savedDate = now || new Date();
    const parts = hongKongDateParts(savedDate);
    return {
      ...result,
      id: `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}-${randomSuffix}`,
      savedAt: savedDate.toISOString(),
      savedAtLocal: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
    };
  }

  function markdownCell(value) {
    if (value === null || value === undefined || value === "") { return "—"; }
    return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
  }

  function answerLabel(answer) {
    if (answer === "T") { return "是"; }
    if (answer === "F") { return "否"; }
    return "未作答";
  }

  function renderMarkdown(record) {
    const summary = record.summary || {};
    const lines = [
      "# MMPI 测试结果",
      "",
      `- 记录编号：\`${record.id}\``,
      `- 保存时间：${record.savedAtLocal}（Asia/Hong_Kong）`,
      `- 测试版本：${record.test.form === "long" ? "完整版（567题）" : "简版（370题）"}`,
      `- 答题模式：${record.test.mode === "learning" ? "学习模式" : "普通测评"}`,
      `- 性别常模：${record.test.gender === "female" ? "Female" : "Male"}`,
      `- 计分常模：${markdownCell(record.test.norm && record.test.norm.label ? record.test.norm.label : "未记录（旧版结果）")}`,
      "",
      "## 作答概况",
      "",
      `- 应答题数：${markdownCell(summary.questionCount)}`,
      `- 已答：${markdownCell(summary.answeredCount)}`,
      `- 是：${markdownCell(summary.trueCount)}`,
      `- 否：${markdownCell(summary.falseCount)}`,
      `- 未作答：${markdownCell(summary.unansweredCount)}`,
      "",
      "## 一致性量表",
      "",
      "| 量表 | 说明 | 原始分 | T分 |",
      "|---|---|---:|---:|"
    ];

    for (const item of record.responseConsistency || []) {
      lines.push(`| ${markdownCell(item.name)} | ${markdownCell(item.description)} | ${markdownCell(item.rawScore)} | ${markdownCell(item.tScore)} |`);
    }

    const ptsdScales = (record.scales || []).filter((scale) => scale.name === "PK" || scale.name === "PS");
    lines.push("", "## PTSD 补充量表（重点）", "");
    if (ptsdScales.length === 0) {
      lines.push("当前结果中没有可用的 PK/PS 数据。", "");
    } else {
      lines.push(
        "| 量表 | 原始分 | T分 | 已答/计分题 | 作答率 | 可解释性 |",
        "|---|---:|---:|---:|---:|---|"
      );
      for (const scale of ptsdScales) {
        const complete = scale.answeredItems === scale.keyedItemCount;
        const interpretation = complete
          ? "题目完整；仍只能作为补充筛查指标"
          : "题目不完整，T分不宜解释";
        lines.push(`| ${markdownCell(scale.name)} | ${markdownCell(scale.rawScore)} | ${markdownCell(scale.tScore)} | ${markdownCell(scale.answeredItems)}/${markdownCell(scale.keyedItemCount)} | ${markdownCell(scale.answeredPercent)}% | ${interpretation} |`);
      }
      lines.push(
        "",
        "> PK、PS 是 PTSD 相关补充量表，不等于 PTSD 诊断。需要结合效度量表、创伤暴露、症状持续时间与功能影响，由专业人员综合判断。",
        ""
      );
    }

    lines.push(
      "## 量表分数",
      "",
      "| 量表 | 中文名称 | 英文说明 | 原始分 | K校正分 | T分 | 作答率 |",
      "|---|---|---|---:|---:|---:|---:|"
    );

    for (const scale of record.scales || []) {
      lines.push(`| ${markdownCell(scale.name)} | ${markdownCell(scale.chineseName)} | ${markdownCell(scale.description)} | ${markdownCell(scale.rawScore)} | ${markdownCell(scale.kCorrectedScore)} | ${markdownCell(scale.tScore)} | ${markdownCell(scale.answeredPercent)}% |`);
    }

    lines.push("", "## 命中的关键项目", "");
    if (!record.criticalItems || record.criticalItems.length === 0) {
      lines.push("无。", "");
    } else {
      lines.push("| 题号 | 关键项目量表 | 作答 | 中文题目 |", "|---:|---|---|---|");
      for (const item of record.criticalItems) {
        lines.push(`| ${markdownCell(item.questionNumber)} | ${markdownCell(item.scaleName)} | ${answerLabel(item.answer)} | ${markdownCell(item.questionZh)} |`);
      }
      lines.push("");
    }

    const compactAnswers = (record.answers || []).map((item) => item.answer || "?").join("");
    lines.push("## 答案摘要", "", "```text");
    for (let index = 0; index < compactAnswers.length; index += 75) {
      lines.push(compactAnswers.slice(index, index + 75));
    }
    lines.push("```", "", "<details>", "<summary>展开逐题答案</summary>", "", "| 题号 | 作答 | 中文题目 | 英文题目 |", "|---:|---|---|---|");
    for (const item of record.answers || []) {
      lines.push(`| ${item.questionNumber} | ${answerLabel(item.answer)} | ${markdownCell(item.questionZh)} | ${markdownCell(item.questionEn)} |`);
    }
    lines.push("", "</details>", "");

    return lines.join("\n");
  }

  return {
    createRecord: createRecord,
    renderMarkdown: renderMarkdown
  };
});
