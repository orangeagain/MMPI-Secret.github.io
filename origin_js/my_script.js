// Append text to the DOM
function append_text(txt) {
    let docbody = resultTarget();
    // docbody.appendChild(document.createTextNode(txt));
    /*meow meow 20230307*/
    let newP = document.createElement("p");
    // newP.setAttribute("text-align", "center");
    newP.style.margin = "0 auto";
    // newP.setAttribute("color", "white");
    newP.style.color = "#FFFFFF";
    let myTextNode = document.createTextNode(txt);
    newP.appendChild(myTextNode);
    docbody.appendChild(newP);
    
    docbody.appendChild(document.createElement("br"));
  }
  
  // Append row data to a row
  function append_td(row, txt) {
    let tdata = document.createElement("td");
    tdata.appendChild(document.createTextNode(txt));
    row.appendChild(tdata);
  }
  
  // Append a row of data to a table
  function append_tr(table) {
    let trow = document.createElement("tr");
    for (let i = 1; i < arguments.length; ++i) {
      append_td(trow, arguments[i]);
    }
    table.appendChild(trow);
  }
  
  // Append a table to the DOM and return a reference to it
  // Arguments are table headings (variable length)
  function make_table() {
    let docbody, table, thead, tbody, trow, i;
  
    docbody = technicalTableTarget || resultTarget();
    table = document.createElement("table");
    table.setAttribute("border", "3");
    
    /*meow meow 20230307*/
    // table.setAttribute("align", "center");
    table.style.margin = "auto";
    table.setAttribute("bgcolor", "#B0C4DE");

    thead = document.createElement("thead");
    table.appendChild(thead);
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
    docbody.appendChild(table);
  
    trow = document.createElement("tr");
    for (i = 0; i < arguments.length; ++i) {
      append_td(trow, arguments[i]);
    }
    thead.appendChild(trow);
  
    return tbody;
  }
  
  longform = true;	// All questions or first 370
  gender = 0;		// 0==male, 1==female
  ans = []; 		// Answers to questions: [T,F,?]
  learningMode = false;

  // 导出的记录保存的是美国常模查表得到的T分。
  // 页面主结果另外展示的“中国常模近似T分”（见 mmpi_cn_norms.js）不写入记录。
  const currentNormMetadata = {
    id: "us-lookup-table",
    label: "美国常模查表T分（页面另显示的中国常模近似T分未写入本记录）",
    region: "US",
    scoreMethod: "项目内置原始分到T分查表"
  };

  // 逐题专业讲解从独立数据文件加载；当前按需求保留为空。
  questionLearningExplanations = window.questionLearningExplanations || {};

  const learningPrimaryScales = new Set([
    "F", "Fb", "Fp", "L", "K", "S",
    "Hs", "D", "Hy", "Pd", "Mf", "Pa", "Pt", "Sc", "Ma", "Si",
    "ANX", "FRS", "OBS", "DEP", "HEA", "BIZ", "ANG", "CYN", "ASP",
    "TPA", "LSE", "SOD", "FAM", "WRK", "TRT"
  ]);

  const learningScaleNames = {
    F: "低频回答", Fb: "后半部分低频回答", Fp: "精神病理低频回答",
    L: "说谎/过度美化", K: "校正/防御性", S: "超级自我呈现",
    Hs: "疑病", D: "抑郁", Hy: "癔症", Pd: "社会偏离",
    Mf: "男性化—女性化", Pa: "偏执", Pt: "精神衰弱",
    Sc: "精神分裂特征", Ma: "轻躁狂", Si: "社会内向",
    D1: "主观抑郁", D2: "精神运动迟滞", D3: "身体功能障碍",
    D4: "思维迟钝", D5: "沉思与反刍",
    Hy1: "否认社交焦虑", Hy2: "情感需求", Hy3: "倦怠与不适",
    Hy4: "躯体不适", Hy5: "攻击性抑制",
    Pd1: "家庭不和", Pd2: "权威问题", Pd3: "社交镇定",
    Pd4: "社会疏离", Pd5: "自我疏离",
    Pa1: "被迫害观念", Pa2: "敏感性", Pa3: "天真",
    Sc1: "社会疏离", Sc2: "情感疏离", Sc3: "自我控制缺失（认知）",
    Sc4: "自我控制缺失（意志）", Sc5: "自我控制缺失（抑制缺陷）",
    Sc6: "异常感觉体验",
    Ma1: "非道德性", Ma2: "精神运动加速", Ma3: "沉着",
    Ma4: "自我膨胀",
    Si1: "害羞与自我意识", Si2: "社交回避", Si3: "自我与他人疏离",
    ANX: "焦虑", FRS: "恐惧", OBS: "强迫性", DEP: "抑郁内容",
    HEA: "健康关注", BIZ: "异常思维", ANG: "愤怒", CYN: "愤世嫉俗",
    ASP: "反社会行为", TPA: "A型行为", LSE: "低自尊",
    SOD: "社交不适", FAM: "家庭问题", WRK: "工作干扰", TRT: "消极治疗指标",
    A: "焦虑", R: "压抑", Es: "自我力量",
    "MAC-R": "麦克安德鲁酗酒量表（修订版）", AAS: "成瘾承认",
    APS: "成瘾倾向", MDS: "婚姻困扰", Ho: "敌意",
    "O-H": "过度控制的敌意", Do: "支配性", Re: "社会责任",
    Mt: "大学适应不良", GM: "男性性别角色", GF: "女性性别角色",
    PK: "创伤后应激障碍", PS: "创伤后应激障碍",
    "D-O": "明显抑郁", "D-S": "隐性抑郁",
    "Hy-O": "明显癔症", "Hy-S": "隐性癔症",
    "Pd-O": "明显社会偏离", "Pd-S": "隐性社会偏离",
    "Pa-O": "明显偏执", "Pa-S": "隐性偏执",
    "Ma-O": "明显轻躁狂", "Ma-S": "隐性轻躁狂",
    dem: "士气低落", som: "躯体不适", lpe: "低积极情绪",
    cyn: "愤世嫉俗", asb: "反社会行为", per: "被迫害观念",
    dne: "功能失调性负性情绪", abx: "异常体验", hpm: "轻躁狂激活",
    AGGR: "攻击性", PSYC: "精神病性", DISC: "行为失控与不受约束",
    NEGE: "负性情绪与神经质", INTR: "内向与低积极情绪",
    FRS1: "广泛恐惧", FRS2: "多重恐惧",
    DEP1: "动力缺乏", DEP2: "心境恶劣", DEP3: "自我贬低",
    DEP4: "自杀意念",
    HEA1: "胃肠道症状", HEA2: "神经系统症状", HEA3: "一般健康关注",
    BIZ1: "精神病性症状", BIZ2: "分裂型特征",
    ANG1: "爆发性行为", ANG2: "易激惹",
    CYN1: "厌世信念", CYN2: "人际猜疑",
    ASP1: "反社会态度", ASP2: "反社会行为",
    TPA1: "不耐烦", TPA2: "竞争驱力",
    LSE1: "自我怀疑", LSE2: "顺从",
    SOD1: "内向", SOD2: "害羞",
    FAM1: "家庭不和", FAM2: "家庭疏离",
    TRT1: "治疗动机不足", TRT2: "无法自我袒露",
    KB1: "科斯—布彻关键项目：急性焦虑",
    KB2: "科斯—布彻关键项目：抑郁与自杀意念",
    KB3: "科斯—布彻关键项目：攻击威胁",
    KB4: "科斯—布彻关键项目：酒精问题导致的情境压力",
    KB5: "科斯—布彻关键项目：精神混乱",
    KB6: "科斯—布彻关键项目：被迫害观念",
    LW1: "拉查—罗贝尔关键项目：焦虑与紧张",
    LW2: "拉查—罗贝尔关键项目：抑郁与担忧",
    LW3: "拉查—罗贝尔关键项目：睡眠障碍",
    LW4: "拉查—罗贝尔关键项目：异常信念",
    LW5: "拉查—罗贝尔关键项目：异常思维与体验",
    LW6: "拉查—罗贝尔关键项目：物质滥用",
    LW7: "拉查—罗贝尔关键项目：反社会态度",
    LW8: "拉查—罗贝尔关键项目：家庭冲突",
    LW9: "拉查—罗贝尔关键项目：问题性愤怒",
    LW10: "拉查—罗贝尔关键项目：性关注与偏离",
    LW11: "拉查—罗贝尔关键项目：躯体症状"
  };

  const rinScaleLabels = {
    VRIN: "逆向回答不一致（Variable Response Inconsistency）",
    TRIN: "同向回答不一致（True Response Inconsistency）"
  };

  function is_critical_item_scale(scale) {
    return scale[3] === undefined && scale[4] === undefined;
  }

  function has_active_tscore_table(scale, selectedGender) {
    const table = scale[3 + selectedGender];
    return Array.isArray(table) && table.length > 0;
  }

  function rin_scale_description(scaleName, fallbackDescription) {
    return rinScaleLabels[scaleName] || fallbackDescription;
  }
  var resultContainer = null;
  var profileCharts = [];
  var technicalTableTarget = null;
  function resultTarget() { return resultContainer || document.body; }
  function resetResults() {
    profileCharts.forEach(function (chart) { chart.destroy(); });
    profileCharts = [];
    technicalTableTarget = null;
    if (resultContainer) resultContainer.parentNode.removeChild(resultContainer);
    resultContainer = document.createElement('section');
    resultContainer.setAttribute('id', 'score-results');
    document.body.appendChild(resultContainer);
  }

  // 只有全部题对都在当前卷内且完成作答，才展示完整的VRIN/TRIN分数。
  function rinComplete(scale, limit) {
    return scale[1].every(function (pair) {
      return pair[0] <= limit && pair[2] <= limit &&
        (ans[pair[0]] === 'T' || ans[pair[0]] === 'F') &&
        (ans[pair[2]] === 'T' || ans[pair[2]] === 'F');
    });
  }

  
  /* meowmeow 20230307 */
  // var ans_debug = ["FTTTTFFFFFTTFTTTTTFFFFTFTTFTTFTTTTTTFFFTTTTFTFFFTFFTTFTTTFTTTTFTTTTFFFFFFFTTTFFFFFFTFFTTTFTFFTTFFFTTTFFFFFTFFTFFFTTTFFFFFFTFTFFTFFTFFTTTFTTFFTFTTFTFFFFTTTFFTTFFFFTFTTTFTTTFTTFFTTTTFFTFFFTFTTTFTFTTTTFFFFFFTTFFTTFTFFFTTFTTFFTFTTTFTTFFFTFTFTTFTFTFTTFFFFFFTFFTTFTTFTFFTTFFFTFTFFTFTFTTTTTTFTFFTFTFFTFFFFFFFTFFFFFFFTTTFTFFFFFTFTFTTTTFFFFTTTTTFFTFFFTTTFFTTTFTFFTFFTTFFTFFFTTTTFTFTTTFTFFTFFTFTFFTTTFTFTFTTTFFTTTFTFFFTTTFTFTFTFTTFTTFFTTTFFTFTFFTTTTTFTTFFFTTFFFTFFTTFTFTFTTTFFTTTFTTFTFFFTTFTFTTFTTFTTFFTTFTFFFTTTFTFTFFTFTFTTTFFFFFTTFFTTTFTTTFTFFTTFFFTFTTFTTTFFFFFFTTFFFFTFFFTTF"]
  

  // Score the test
  function score() {
    resetResults();
    if (!longform) ans = ans.slice(0, short_form_question_count() + 1);
    var answerLimit = longform ? questions.length - 1 : short_form_question_count();
    // Change mouse pointer to wait indicator
    // This does not seem to work because JavaScript blocks the UI message pump :(
    document.body.style.cursor = "wait";
  
    // Variable declarations
    let i, j, tscale, q, n, s, rp;
    let k, rawscore, kscore, tscore, percent;
    let t_cnt, f_cnt, cs_cnt, pe;
  
    // Keep the detailed tables together until the basic result has been rendered.
    let technicalTables = document.createElement('section');
    technicalTableTarget = technicalTables;
    // Make the scale and critical item tables
    let scale_table = make_table("Scale", "Scale Description", "Raw Score", "K Score", "T Score (美国常模)", "% Answered");
    let ci_table = make_table("Scale", "Scale Description", "Question", "Answer", "Question Text");
    technicalTableTarget = null;

    let tscoreArray = [];
  
    // Count the number of True, False, and Can't Say answers
    n = longform ? questions.length : 371;
    t_cnt = 0;
    f_cnt = 0;
    cs_cnt = 0;
    for (q = 1; q < n; ++q) {
      switch (ans[q]) {
        case "T":
          ++t_cnt;
          break;
        case "F":
          ++f_cnt;
          break;
        default:
          ++cs_cnt;
          break;
      }
    }
    --q;
  
    // Add T/F/? stats to scale table
    append_tr(scale_table, "True", " ", t_cnt, " ", " ", (t_cnt * 100 / q).toPrecision(3));
    append_tr(scale_table, "False", " ", f_cnt, " ", " ", (f_cnt * 100 / q).toPrecision(3));
    append_tr(scale_table, "?", " ", cs_cnt, " ", " ", (cs_cnt * 100 / q).toPrecision(3));
  
    // Score the TRIN/VRIN scales
    // Iterate the *RIN scales
    for (i = 0; i < rin.length; ++i) {
      // Start with default score
      rawscore = rin[i][0][2];
      // Iterate all the answer pairs
      for (j = 0; j < rin[i][1].length; ++j) {
        // Get reference to answer pair
        rp = rin[i][1][j];
        // If answers match, update the raw score
        if (ans[rp[0]] === rp[1] && ans[rp[2]] === rp[3]) {
          rawscore += rp[4];
        }
      }
      // Append results to scale table
      // append_tr(scale_table, rin[i][0][0], rin[i][0][1], rawscore, " ", rin[i][2 + gender][rawscore], " ");
      // 20240823 同样的，值为undefined的时候，显示别的东西。注意TRIN与VRIN与其他的表项是分开处理的。话说这两项是什么意思来着？
      var complete = rinComplete(rin[i], answerLimit);
      append_tr(scale_table, rin[i][0][0], rin_scale_description(rin[i][0][0], rin[i][0][1]),
        complete ? rawscore : '未完整作答', " ",
        complete ? (rin[i][2 + gender][rawscore] === undefined ? "过高或过低" : rin[i][2 + gender][rawscore]) : '不可计算', " ");
    }
  
    // Score the scales and critical items
    k = 0;
    pe = 0;
    // Iterate all the scales
    for (i = 0; i < scales.length; ++i) {
      n = 0;
      rawscore = 0;
      // Get the T score table, critcal items will not have this (undefined)
      tscale = scales[i][3 + gender];
      // 短卷不能给依赖后197题的量表产生部分原始分/T分。
      if (!longform && scales[i][1].concat(scales[i][2]).some(function (item) { return item > 370; })) {
        tscoreArray[i] = undefined;
        if (tscale !== undefined && tscale.length)
          append_tr(scale_table, scales[i][0][1], scales[i][0][2], '短卷不适用', ' ', '不可计算', ' ');
        continue;
      }
      // Mf的另一性别条目没有T表，不能误报成受测者分数过高/过低。
      if (tscale !== undefined && !tscale.length) {
        tscoreArray[i] = undefined;
        continue;
      }
      // Iterate the True question list
      for (j = 0; j < scales[i][1].length; ++j) {
        // Get the question number
        q = scales[i][1][j];
        // Act upon the answer to that question
        switch (ans[q]) {
          // True
          case "T":
            // Increment the answer count
            ++n;
            // Increment raw score only if True
            ++rawscore;
            // If this is a critcal item, add it to the critical items table
            if (tscale === undefined) {
              append_tr(ci_table, scales[i][0][1], scales[i][0][2], q, "True", questions[q]);
            }
            break;
          case "F":
            // Increment the answer count
            ++n;
            break;
        }
      }
      // Iterate the False question list (same procedure as True above)
      for (j = 0; j < scales[i][2].length; ++j) {
        q = scales[i][2][j];
        switch (ans[q]) {
          case "F":
            ++n;
            ++rawscore;
            if (tscale === undefined) {
              append_tr(ci_table, scales[i][0][1], scales[i][0][2], q, "False", questions[q]);
            }
            break;
          case "T":
            ++n;
            break;
        }
      }
      // Add scale results to scale table
      // T score table must be defined, otherwise this is a critical item
      if (tscale !== undefined) {
        // Capture K for future use
        if (scales[i][0][0] === "K") { k = rawscore; }
        // If there is a K correction, use it
        if (tscale[0]) {
          // Adjust with K
          kscore = k * tscale[0] + rawscore;
          // Round off and make integer
          kscore = Math.floor(kscore + 0.5);
          // T score lookup of corrected score
          tscore = tscale[kscore + 1];
          // No K correction
        } else {
          // K score is undefinded
          kscore = undefined;
          // T score lookup of raw score
          tscore = tscale[rawscore + 1];
        }
        // Calculate percent answered
        percent = n * 100 / (scales[i][1].length + j);
        // Append results to score table

        tscoreArray[i] = tscore;

        // append_tr(scale_table, scales[i][0][1], scales[i][0][2], rawscore, kscore === undefined ? " " : kscore, tscore, percent.toPrecision(3));
        // 20240823 尝试在tscore为undefined时，显示别的东西？
        append_tr(scale_table, scales[i][0][1], scales[i][0][2], rawscore, kscore === undefined ? " " : kscore, tscore === undefined ? "过高或过低" : tscore, percent.toPrecision(3));

  
        // Update profile elevation for the 8 scales
        switch (scales[i][0][1]) {
          case "Hs":
          case "D":
          case "Hy":
          case "Pd":
          case "Pa":
          case "Pt":
          case "Sc":
          case "Ma":
            pe += tscore;
            break;
        }
      }
    }

    // 这个居中死活调不好，爷不要啦，干
    // // Convert profile elevation sum to average (divide by number of scales)
    // pe /= 8;
    // // Show profile elevation in page
    // append_text("Profile Elevation: " + pe.toPrecision(3));
  
    // // Show an answer summary to allow for copy & paste of answers
    // append_text("Answer Summary");
    // s = "";
    // for (q = 1; q < questions.length; ++q) {
    //   s += ans[q];
    //   if (s.length >= 75) {
    //     append_text(s);
    //     s = "";
    //   }
    // }
    // if (s.length) { append_text(s); }
  
    // Restore mouse pointer
    document.body.style.cursor = "auto";


    /* 2023.11.16 尝试对undefined值做出警告 */
    // 所有需要的值都在tscoreArray中
    // 根据下面画图的函数推断，L F K对应的脚标应当是3 0 4
    // 不过L好像不会是undefined？记不清了，先写两个的编码吧，要不然太麻烦。有点懒。
    let encodeLFK; //从硬件编码里面找到的灵感
    // if(tscoerArray[3] === undefined && tscoreArray[0] === undefined && tscoreArray[4] === undefined){
    //   encodeLFK = 1
    // }
    if(tscoreArray[0] === undefined && tscoreArray[4] === undefined){
      encodeLFK = 0b11;
    }else if(tscoreArray[0] === undefined && tscoreArray[4] !== undefined){
      encodeLFK = 0b10;
    }else if(tscoreArray[0] !== undefined && tscoreArray[4] === undefined){
      encodeLFK = 0b01;
    }else{
      encodeLFK = 0b00;
    }

    switch (encodeLFK) {
      case 0b01:
        alert("侦测到您的K值是undefined，您可能没能很好理解题意，导致了误选。您的数据已经超出了量表的衡量范围。详见github issue   （https://github.com/MMPI-CHN/MMPI-CHN.github.io/issues/3）");
        break;
      case 0b10:
        alert("侦测到您的F值是undefined，您可能没能很好理解题意，导致了误选。您的数据已经超出了量表的衡量范围。详见github issue   （https://github.com/MMPI-CHN/MMPI-CHN.github.io/issues/3）");
        break;
      case 0b11:
        alert("侦测到您的F与K值是undefined，您可能没能很好理解题意，导致了误选。您的数据已经超出了量表的衡量范围。详见github issue   （https://github.com/MMPI-CHN/MMPI-CHN.github.io/issues/3）");
        break;
      case 0b00:
      default:
        // 
        break;
    }

    /* 突然想到的另一个优化点：万一他们临床量表也出了问题呢？ */
    /* 不过这里需要分性别。Mf的脚标是分男女的。 */
    /* 只选取某几个关键值侦测 */
    // Female： 6 7 8 9 11 12 13 14 15 16
    // Male： 6 7 8 9 10 12 13 14 15 16
    // 暂时不管内容量表。项太多了，不少项我都不认识。
    if(gender === 0){
      // Male
      if(tscoreArray[6] === undefined || tscoreArray[7] === undefined || 
        tscoreArray[8] === undefined || tscoreArray[9] === undefined || 
        tscoreArray[9] === undefined || tscoreArray[10] === undefined || 
        tscoreArray[12] === undefined || tscoreArray[13] === undefined || 
        tscoreArray[14] === undefined || tscoreArray[15] === undefined || 
        tscoreArray[16] === undefined){
          alert("侦测到您的临床量表中有值是undefined，您可能没能很好理解题意，导致了误选。您的数据已经超出了量表的衡量范围。详见github issue   （https://github.com/MMPI-CHN/MMPI-CHN.github.io/issues/3）");
      }
    }else{
      // Female
      if(tscoreArray[6] === undefined || tscoreArray[7] === undefined || 
        tscoreArray[8] === undefined || tscoreArray[9] === undefined || 
        tscoreArray[9] === undefined || tscoreArray[11] === undefined || 
        tscoreArray[12] === undefined || tscoreArray[13] === undefined || 
        tscoreArray[14] === undefined || tscoreArray[15] === undefined || 
        tscoreArray[16] === undefined){
          alert("侦测到您的临床量表中有值是undefined，您可能没能很好理解题意，导致了误选。您的数据已经超出了量表的衡量范围。详见github issue   （https://github.com/MMPI-CHN/MMPI-CHN.github.io/issues/3）");
        }
    }


    // 根据性别，打出效度量表、临床量表及内容量表的剖析图。可能还会添加特殊项目量表。
    start_to_creat_profile(tscoreArray);

    // 根据结果（T分），打出对应的诊断。以表格方式呈现。
    // start_to_print_result(tscoreArray);

    // Debug...
    start_to_print_result(resultArray, tscoreArray, technicalTables);
  }
  
  // Read status of radio button group and return value of selected button
  function radio_value(rb) {
    if (!rb) { return; }
    for (let i = 0; i < rb.length; i++) {
      if (rb[i].checked === true) {
        return rb[i].value;
      }
    }
  }

  function result_value_or_null(value) {
    return value === undefined || (typeof value === "number" && !Number.isFinite(value))
      ? null
      : value;
  }

  function build_test_result() {
    const questionCount = longform ? questions.length - 1 : 370;
    const savedAnswers = [];
    let trueCount = 0;
    let falseCount = 0;
    let unansweredCount = 0;

    for (let questionNumber = 1; questionNumber <= questionCount; questionNumber++) {
      const answer = ans[questionNumber] === "T" || ans[questionNumber] === "F"
        ? ans[questionNumber]
        : "?";
      if (answer === "T") { trueCount++; }
      else if (answer === "F") { falseCount++; }
      else { unansweredCount++; }

      savedAnswers.push({
        questionNumber: questionNumber,
        answer: answer,
        questionZh: questions_zh[questionNumber] || "",
        questionEn: questions[questionNumber] || ""
      });
    }

    const responseConsistency = rin.map(function(rinScale) {
      let rawScore = rinScale[0][2];
      rinScale[1].forEach(function(pair) {
        if (ans[pair[0]] === pair[1] && ans[pair[2]] === pair[3]) {
          rawScore += pair[4];
        }
      });
      const tScoreTable = rinScale[2 + gender];
      return {
        name: rinScale[0][0],
        description: rin_scale_description(rinScale[0][0], rinScale[0][1]),
        rawScore: rawScore,
        tScore: result_value_or_null(tScoreTable ? tScoreTable[rawScore] : undefined)
      };
    });

    const savedScales = [];
    const criticalItems = [];
    let kRawScore = 0;

    scales.forEach(function(scale) {
      const metadata = scale[0] || [];
      const scaleName = metadata[1] || "未命名量表";
      const criticalScale = is_critical_item_scale(scale);
      const tScoreTable = scale[3 + gender];
      if (!criticalScale && !has_active_tscore_table(scale, gender)) { return; }

      let rawScore = 0;
      let answeredItems = 0;

      scale[1].forEach(function(questionNumber) {
        if (ans[questionNumber] === "T" || ans[questionNumber] === "F") {
          answeredItems++;
        }
        if (ans[questionNumber] === "T") {
          rawScore++;
          if (criticalScale) {
            criticalItems.push({
              scaleName: scaleName,
              scaleDescription: metadata[2] || "",
              questionNumber: questionNumber,
              answer: "T",
              questionZh: questions_zh[questionNumber] || "",
              questionEn: questions[questionNumber] || ""
            });
          }
        }
      });

      scale[2].forEach(function(questionNumber) {
        if (ans[questionNumber] === "T" || ans[questionNumber] === "F") {
          answeredItems++;
        }
        if (ans[questionNumber] === "F") {
          rawScore++;
          if (criticalScale) {
            criticalItems.push({
              scaleName: scaleName,
              scaleDescription: metadata[2] || "",
              questionNumber: questionNumber,
              answer: "F",
              questionZh: questions_zh[questionNumber] || "",
              questionEn: questions[questionNumber] || ""
            });
          }
        }
      });

      if (criticalScale) { return; }
      if (metadata[0] === "K") { kRawScore = rawScore; }

      let kCorrectedScore = null;
      let scoreLookupIndex = rawScore;
      if (tScoreTable[0]) {
        kCorrectedScore = Math.floor(kRawScore * tScoreTable[0] + rawScore + 0.5);
        scoreLookupIndex = kCorrectedScore;
      }

      const keyedItemCount = scale[1].length + scale[2].length;
      savedScales.push({
        code: result_value_or_null(metadata[0]),
        name: scaleName,
        chineseName: learningScaleNames[scaleName] || "",
        description: metadata[2] || "",
        rawScore: rawScore,
        kCorrectedScore: kCorrectedScore,
        tScore: result_value_or_null(tScoreTable[scoreLookupIndex + 1]),
        answeredItems: answeredItems,
        keyedItemCount: keyedItemCount,
        isComplete: answeredItems === keyedItemCount,
        answeredPercent: keyedItemCount > 0
          ? Number((answeredItems * 100 / keyedItemCount).toFixed(2))
          : 0
      });
    });

    return {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      test: {
        instrument: "MMPI-2",
        form: longform ? "long" : "short",
        questionCount: questionCount,
        gender: gender === 1 ? "female" : "male",
        mode: learningMode ? "learning" : "standard",
        norm: currentNormMetadata
      },
      summary: {
        questionCount: questionCount,
        answeredCount: questionCount - unansweredCount,
        trueCount: trueCount,
        falseCount: falseCount,
        unansweredCount: unansweredCount
      },
      responseConsistency: responseConsistency,
      scales: savedScales,
      criticalItems: criticalItems,
      answers: savedAnswers
    };
  }

  let resultSaveSequence = 0;

  function append_ptsd_result_summary(result) {
    const ptsdScales = result.scales.filter(function(scale) {
      return scale.name === "PK" || scale.name === "PS";
    });
    if (ptsdScales.length === 0) { return; }

    const section = document.createElement("section");
    section.className = "ptsd-result-summary";

    const heading = document.createElement("h2");
    heading.textContent = "PTSD 补充量表（PK / PS）";
    section.appendChild(heading);

    const intro = document.createElement("p");
    intro.textContent = "以下项目已从完整结果中单独列出，便于查看。PK、PS是补充筛查指标，不能单独诊断PTSD。";
    section.appendChild(intro);

    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    ["量表", "原始分", "T分", "已答/计分题", "作答率", "可解释性"].forEach(function(label) {
      const cell = document.createElement("th");
      cell.textContent = label;
      headerRow.appendChild(cell);
    });
    table.appendChild(headerRow);

    ptsdScales.forEach(function(scale) {
      const row = document.createElement("tr");
      const complete = scale.answeredItems === scale.keyedItemCount;
      const values = [
        scale.name,
        scale.rawScore,
        scale.tScore === null ? "过高或过低" : scale.tScore,
        scale.answeredItems + "/" + scale.keyedItemCount,
        scale.answeredPercent + "%",
        complete ? "题目完整；仅作补充筛查" : "题目不完整，T分不宜解释"
      ];
      values.forEach(function(value, index) {
        const cell = document.createElement("td");
        cell.textContent = value;
        if (!complete && index === values.length - 1) {
          cell.className = "score-warning";
        }
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
    section.appendChild(table);

    const note = document.createElement("p");
    note.textContent = "解释时还需要结合效度量表、明确的创伤暴露、侵入性症状、回避、情绪或认知变化、警觉性变化、持续时间和功能影响。";
    section.appendChild(note);
    // 放进结果容器，重新提交时随旧结果一起清除。
    resultTarget().appendChild(section);
  }

  // 只有通过 npm start 的本地服务器访问时才把结果写入磁盘；
  // 在 GitHub Pages 等纯静态托管上没有后端，作答数据不离开浏览器，改为提供下载。
  function has_local_result_server() {
    return location.protocol === "http:" &&
      (location.hostname === "127.0.0.1" || location.hostname === "localhost");
  }

  function append_result_download_link(container, label, fileName, mimeType, content) {
    const link = document.createElement("a");
    link.className = "my_button";
    link.textContent = label;
    link.download = fileName;
    link.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
    container.appendChild(link);
  }

  function offer_result_downloads(result, status, leadText) {
    const randomSuffix = Math.random().toString(16).slice(2, 10).padEnd(8, "0");
    const record = MmpiResultReport.createRecord(result, randomSuffix);
    status.className = "result-save-status is-success";
    status.textContent = leadText;
    status.appendChild(document.createElement("br"));
    append_result_download_link(status, "下载 Markdown 报告", record.id + ".md",
      "text/markdown;charset=utf-8", MmpiResultReport.renderMarkdown(record));
    append_result_download_link(status, "下载 JSON 数据", record.id + ".json",
      "application/json;charset=utf-8", JSON.stringify(record, null, 2) + "\n");
  }

  async function save_test_result(result) {
    const status = document.getElementById("result-save-status");
    const currentSequence = ++resultSaveSequence;

    if (!has_local_result_server()) {
      if (status) {
        status.hidden = false;
        offer_result_downloads(result, status,
          "计分已在本浏览器中完成，作答数据没有上传到任何服务器。如需留存，请下载：");
      }
      return;
    }

    if (status) {
      status.hidden = false;
      status.className = "result-save-status is-saving";
      status.textContent = "正在把测试结果保存到本地服务器……";
    }

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });
      const payload = await response.json().catch(function() { return {}; });
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "服务器返回保存失败");
      }
      if (currentSequence !== resultSaveSequence || !status) { return; }
      status.className = "result-save-status is-success";
      status.textContent = "已保存到 " + payload.directory + "/" + payload.markdownFile +
        "；同目录还保存了结构化JSON文件 " + payload.jsonFile + "。";
    } catch (error) {
      if (currentSequence !== resultSaveSequence || !status) { return; }
      offer_result_downloads(result, status,
        "本地服务器保存失败（" + error.message + "），可改为直接下载：");
    }
  }
  
  // Fill the answer array with radio button state and score
  function score_rb(form) {
    ans = [undefined];
    // 2026-09 修复：短卷只读前 370 题，其余留空（不再伪造成 197 个 "?"）
    const __limit = longform ? questions.length : (short_form_question_count() + 1);
    for (let i = 1; i < __limit; ++i) {
      let rbv = radio_value(form.elements["Q" + i]);
      if (rbv) {
        ans.push(rbv);
      } else {
        ans.push("?");
      }
    }
    // 先发起本地保存，再运行原有同步计分与弹窗流程。
    // 即使原结果渲染因极端/缺失答案弹出警告，保存请求也不会被阻断。
    const testResult = build_test_result();
    save_test_result(testResult);
    score();
    append_ptsd_result_summary(testResult);


    /* 2023.11.16 尝试对undefined值做出警告 */
    // 看了一眼，好像要到score()这个函数里面去找变量

    // 20230525凌晨加的
    // 创建图片元素
    var img = document.createElement('img');
    img.src = './money.png'; // 替换为要显示的图片路径

    // 设置图片样式
    img.style.width = '15%'; // 设置宽度为50%
    img.style.display = 'block'; // 设置为块级元素
    img.style.margin = 'auto'; // 设置居中对齐

    // 创建注释性文字元素
    var span = document.createElement('span');
    var span2 = document.createElement('span2');
    var text = document.createTextNode('如果我业余时间的工作或多或少对您有一些帮助，可以随意打赏一些让我知道我的工作或许是有意义的。'); 
    var text2 = document.createTextNode('观心自在，欢喜随缘，多少无谓。');
    span.appendChild(text);
    span2.appendChild(text2);

    // 设置文字样式
    span.style.display = 'block'
    span.style.textAlign= 'center'; // 设置居中对齐
    span.style.color = '#B0C4DE'; // 设置文字颜色
    span.style.fontFamily = 'KaiTi'; // 设置字体为楷体
    span2.style.display = 'block'
    span2.style.textAlign= 'center'; // 设置居中对齐
    span2.style.color = '#B0C4DE'; // 设置文字颜色
    span2.style.fontFamily = 'KaiTi'; // 设置字体为楷体
   
    // 插入三个空白行
    resultTarget().appendChild(document.createElement('br'));
    resultTarget().appendChild(document.createElement('br'));
    resultTarget().appendChild(document.createElement('br'));

    // 将图片元素添加到文档中
    resultTarget().appendChild(img);

    resultTarget().appendChild(document.createElement('br'));
    resultTarget().appendChild(document.createElement('br'));
    resultTarget().appendChild(span);
    resultTarget().appendChild(span2);
  }
  
  // 20240823 尝试在“界面”中把结果字符串打出来给用户看，并且附到邮件中发给我
  var global_ans;

  // Fill the answer array from text and score
  function score_text(anstext) {
    //alert("Score Text: "+anstext.length);
    ans = [undefined];
    let n = 1;
    // Check each character of text
    for (let i = 0; i < anstext.length; ++i) {
      // Ignore control characters (0 to 31) and space (32)
      if (anstext.charCodeAt(i) > 32) {
        // Convert character to 'T','F' or '?'
        let a;
        switch (anstext.charAt(i)) {
          case "T":
          case "t":
          case "Y":
          case "y":
          case "X":
          case "x":
            a = "T";
            break;
          case "F":
          case "f":
          case "N":
          case "n":
          case "O":
          case "o":
            a = "F";
            break;
          case "?":
          case "-":
            a = "?";
            break;
          default:
            a = undefined;
            break;
        }
        // Save valid answer in answer array
        if (a) {
          ans.push(a);
          ++n;
        }
      }
    }
    alert((n - 1) + " answers entered");
    // If too few valid characters where processed, fill the remaining answers with '?'
    for (; n < questions.length; ++n) { ans.push("?"); }

    // // 20240823 拷贝所有的“结果”，注意附上性别
    // global_ans = ans;
    // // global_ans = gender.toString() + ans;

    // Score it
    score();
  }
  
  // Set the test gender - called by onclick() event in the form
  function set_gender(g) {
    gender = g;

    // 2024.5.14 尝试加一个不可见的问题，并且通过性别那里的onclick在这里标注出来
    // 0是男性 1是女性 3是Error
    const form = document.getElementById("select_all");
    form.elements['invisible_question'].value = g;

    if (learningMode) {
      refresh_learning_feedback();
    }

    //alert("gender: "+g);
  }
  
  // Set the test length - called by onclick() event in the form
  // 2026-09 修复：原实现只切换了 div 的显示，从未更新 longform 变量，
  // 导致选择"短卷"时计分仍按 567 题进行，第 371~567 题全部计为 "?"（197 个未答），
  // CS 计数飙升、内容量表原始分接近 0，整张剖析图作废。
  function use_long_form(lf) {
    longform = lf;
    let lfd = document.getElementById("longformdiv");
    lfd.style.display = lf ? "inline" : "none";
  }

  function set_learning_mode(enabled) {
    learningMode = Boolean(enabled);
    document.body.classList.toggle("learning-mode-active", learningMode);

    const note = document.getElementById("learning-mode-note");
    if (note) {
      note.hidden = !learningMode;
    }

    if (learningMode) {
      refresh_learning_feedback();
    } else {
      document.querySelectorAll(".learning-feedback").forEach(function(feedback) {
        feedback.hidden = true;
      });
    }
  }

  function refresh_learning_feedback() {
    if (!learningMode || !document.forms.questions) { return; }

    for (let questionNumber = 1; questionNumber < questions.length; questionNumber++) {
      const selectedAnswer = radio_value(document.forms.questions.elements["Q" + questionNumber]);
      if (selectedAnswer) {
        render_learning_feedback(questionNumber, selectedAnswer);
      }
    }
  }

  function handle_learning_answer(questionNumber, answer) {
    if (!learningMode) { return; }
    render_learning_feedback(questionNumber, answer);

    // 一致性量表由题对共同计分。答完当前题时，同时刷新已经回答的配对题。
    get_rin_impacts(questionNumber).forEach(function(impact) {
      const pairedAnswer = radio_value(document.forms.questions.elements["Q" + impact.otherQuestion]);
      if (pairedAnswer) {
        render_learning_feedback(impact.otherQuestion, pairedAnswer);
      }
    });
  }

  function get_scale_impacts(questionNumber, answer) {
    const impacts = [];

    scales.forEach(function(scale) {
      const metadata = scale[0] || [];
      const scaleName = metadata[1] || "未命名量表";
      const trueKeyed = scale[1].indexOf(questionNumber) !== -1;
      const falseKeyed = scale[2].indexOf(questionNumber) !== -1;
      if (!trueKeyed && !falseKeyed) { return; }

      const isCriticalItemGroup = is_critical_item_scale(scale);
      const isUsedForSelectedGender = isCriticalItemGroup || has_active_tscore_table(scale, gender);
      if (!isUsedForSelectedGender) { return; }

      const keyedAnswer = trueKeyed ? "T" : "F";
      impacts.push({
        name: scaleName,
        description: metadata[2] || "",
        keyedAnswer: keyedAnswer,
        matched: answer === keyedAnswer,
        critical: isCriticalItemGroup,
        primary: learningPrimaryScales.has(scaleName),
        normLabel: scaleName === "Mf" ? (gender === 0 ? "男性常模" : "女性常模") : "",
        tscoreDirection: scaleName === "Mf" ? (gender === 0 ? "上升" : "下降") : ""
      });
    });

    return impacts;
  }

  function get_rin_impacts(questionNumber) {
    const impacts = [];

    rin.forEach(function(rinScale) {
      const scaleName = rinScale[0][0];
      const scaleDescription = rinScale[0][1];
      rinScale[1].forEach(function(pair) {
        if (pair[0] !== questionNumber && pair[2] !== questionNumber) { return; }

        const isFirst = pair[0] === questionNumber;
        impacts.push({
          name: scaleName,
          description: rin_scale_description(scaleName, scaleDescription),
          keyedAnswer: isFirst ? pair[1] : pair[3],
          otherQuestion: isFirst ? pair[2] : pair[0],
          otherKeyedAnswer: isFirst ? pair[3] : pair[1],
          delta: pair[4]
        });
      });
    });

    return impacts;
  }

  function answer_label(answer) {
    return answer === "T" ? "是" : "否";
  }

  function rin_pair_meaning(impact) {
    if (impact.name === "VRIN") {
      return "该组合会增加VRIN原始分，表示这组题被计分键标记为内容回答不一致。";
    }

    if (impact.name === "TRIN" && impact.delta > 0) {
      return "该组合会使TRIN向肯定作答方向变化，表示更偏向连续选择“是”。";
    }

    if (impact.name === "TRIN" && impact.delta < 0) {
      return "该组合会使TRIN向否定作答方向变化，表示更偏向连续选择“否”。";
    }

    return "该组合会改变该一致性指标的原始分。";
  }

  function append_learning_impact_list(container, impacts) {
    const list = document.createElement("ul");

    impacts.forEach(function(impact) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const chineseName = learningScaleNames[impact.name];
      const labelDetail = impact.normLabel || chineseName;
      title.textContent = impact.name + (impact.description ? " · " + impact.description : "") +
        (labelDetail ? "（" + labelDetail + "）" : "");
      item.appendChild(title);

      const effect = document.createElement("span");
      effect.className = impact.matched ? "learning-points-hit" : "learning-points-miss";
      if (impact.critical) {
        effect.textContent = impact.matched ? " — 命中关键项目" : " — 未命中关键项目";
      } else {
        effect.textContent = impact.matched ? " — 原始分 +1" : " — 原始分 +0";
      }
      item.appendChild(effect);

      const key = document.createElement("div");
      key.textContent = "计分方向：回答“" + answer_label(impact.keyedAnswer) + "”时" +
        (impact.critical ? "命中该关键项目。" : "计入1个原始分。最终T分还会受常模换算及可能的K校正影响。");
      item.appendChild(key);

      if (impact.tscoreDirection) {
        const direction = document.createElement("div");
        direction.textContent = "Mf换算方向：在" + impact.normLabel + "中，原始分增加会使最终T分倾向" +
          impact.tscoreDirection + "。这不是另一个独立的“男性化分”或“女性化分”。";
        item.appendChild(direction);
      }

      list.appendChild(item);
    });

    container.appendChild(list);
  }

  function render_learning_feedback(questionNumber, answer) {
    const feedback = document.getElementById("learning-feedback-" + questionNumber);
    if (!feedback || !learningMode) { return; }

    feedback.textContent = "";
    feedback.hidden = false;

    const heading = document.createElement("h3");
    heading.textContent = "第 " + questionNumber + " 题计分拆解";
    feedback.appendChild(heading);

    const selected = document.createElement("p");
    selected.textContent = "你的选择：" + answer_label(answer) + "。以下只展示当前项目在本项目计分键中的直接影响。";
    feedback.appendChild(selected);

    const impacts = get_scale_impacts(questionNumber, answer);
    const primaryImpacts = impacts.filter(function(impact) { return impact.primary; });
    const additionalImpacts = impacts.filter(function(impact) { return !impact.primary; });

    if (primaryImpacts.length > 0) {
      const subheading = document.createElement("h4");
      subheading.textContent = "主要影响量表";
      feedback.appendChild(subheading);
      append_learning_impact_list(feedback, primaryImpacts);
    }

    if (additionalImpacts.length > 0) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "查看另外 " + additionalImpacts.length + " 个细分、补充或关键项目量表";
      details.appendChild(summary);
      append_learning_impact_list(details, additionalImpacts);
      feedback.appendChild(details);
    }

    if (impacts.length === 0) {
      const noDirectScore = document.createElement("p");
      noDirectScore.textContent = "本题未出现在当前性别所使用的单项量表计分键中。";
      feedback.appendChild(noDirectScore);
    }

    const rinImpacts = get_rin_impacts(questionNumber);
    if (rinImpacts.length > 0) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "一致性题对（" + rinImpacts.length + " 组）";
      details.appendChild(summary);

      const list = document.createElement("ul");
      rinImpacts.forEach(function(impact) {
        const otherAnswer = radio_value(document.forms.questions.elements["Q" + impact.otherQuestion]);
        const pairMatched = answer === impact.keyedAnswer && otherAnswer === impact.otherKeyedAnswer;
        const item = document.createElement("li");
        const scoringRule = "与第 " + impact.otherQuestion + " 题组成题对。计分组合：本题“" +
          answer_label(impact.keyedAnswer) + "”且配对题“" + answer_label(impact.otherKeyedAnswer) +
          "”，此时题对变化 " + (impact.delta > 0 ? "+" : "") + impact.delta + "。";
        let currentStatus = "配对题尚未作答，因此暂时不能判断该题对是否计分。";
        if (otherAnswer) {
          const currentCombination = "当前组合：本题“" + answer_label(answer) + "”、第 " +
            impact.otherQuestion + " 题“" + answer_label(otherAnswer) + "”。";
          currentStatus = pairMatched
            ? currentCombination + "已触发上述计分组合，题对变化 " +
              (impact.delta > 0 ? "+" : "") + impact.delta + "。"
            : currentCombination + "没有触发上述计分组合，本题对变化 0。";
        }
        item.textContent = impact.name + " · " + impact.description + "：" + scoringRule +
          rin_pair_meaning(impact) + currentStatus;
        list.appendChild(item);
      });
      details.appendChild(list);
      feedback.appendChild(details);
    }

    const explanation = document.createElement("p");
    explanation.className = "learning-explanation-placeholder";
    explanation.textContent = questionLearningExplanations[questionNumber]
      ? "本题讲解：" + questionLearningExplanations[questionNumber]
      : "本题讲解：待补充";
    feedback.appendChild(explanation);
  }
  // 短卷（前 370 题）可有效计分的量表：13 个基础量表（L F K 1-0）最大题号 <= 370。
  // 内容量表与 Fb 依赖 371 题以后的项目，短卷下无效，必须不予呈现。
  function short_form_question_count() { return 370; }
  
  
  
  function my_doc_write_all_questions() {
    for (var i = 1; i < questions.length; ++i) {
      my_doc_write_question(i, "Q" + i, i + ". " + questions[i], questions_zh[i]);
      if (i === 370) { document.write("<div id=\"longformdiv\">"); }
    }
    if (i > 370) { document.write("<\/div>"); }
  }
  
  function my_doc_write_question(questionNumber, name, text, text_zh) {
    document.write("<section class=\"question-card\" id=\"question-card-" + questionNumber + "\">");
    document.write("<div class=\"question-copy\">" + text + "<br>" + text_zh + "</div>");
    document.write("<div class=\"answer-options\">");

    /* 下面这行是原版。现在为了debug，加一个checked标签使该选项默认选中 */ 
    document.write("<label class=\"answer-option\"><input type=\"radio\" id=\"" + name + "\" name=\"" + name + "\" value=\"T\" required=\"required\" onchange=\"handle_learning_answer(" + questionNumber + ", this.value)\"><span class=\"answer-option__surface\">符合</span></label>");

    /* For debugging... */
    // document.write("<input type=\"radio\" id=" + name + " name=\"" + name + "\" value=\"T\" required=\"required\" checked=\"checked\"><label for=" + name + ">是</label>");

    // document.write("<input type=\"radio\" name=" + name + " value=\"T\" >是");
    // document.write("<input type=\"radio\" name=" + name + " value=\"F\">否");
    document.write("<label class=\"answer-option\"><input type=\"radio\" id=\"Not_" + name + "\" name=\"" + name + "\" value=\"F\" required=\"required\" onchange=\"handle_learning_answer(" + questionNumber + ", this.value)\"><span class=\"answer-option__surface\">不符合</span></label>");
    document.write("</div>");
    document.write("<div class=\"learning-feedback\" id=\"learning-feedback-" + questionNumber + "\" aria-live=\"polite\" hidden></div>");
    document.write("</section>");
  }



  // var ans_str = "FTTTTFFFFFTTFTTTTTFFFFTFTTFTTFTTTTTTFFFTTTTFTFFFTFFTTFTTTFTTTTFTTTTFFFFFFFTTTFFFFFFTFFTTTFTFFTTFFFTTTFFFFFTFFTFFFTTTFFFFFFTFTFFTFFTFFTTTFTTFFTFTTFTFFFFTTTFFTTFFFFTFTTTFTTTFTTFFTTTTFFTFFFTFTTTFTFTTTTFFFFFFTTFFTTFTFFFTTFTTFFTFTTTFTTFFFTFTFTTFTFTFTTFFFFFFTFFTTFTTFTFFTTFFFTFTFFTFTFTTTTTTFTFFTFTFFTFFFFFFFTFFFFFFFTTTFTFFFFFTFTFTTTTFFFFTTTTTFFTFFFTTTFFTTTFTFFTFFTTFFTFFFTTTTFTFTTTFTFFTFFTFTFFTTTFTFTFTTTFFTTTFTFFFTTTFTFTFTFTTFTTFFTTTFFTFTFFTTTTTFTTFFFTTFFFTFFTTFTFTFTTTFFTTTFTTFTFFFTTFTFTTFTTFTTFFTTFTFFFTTTFTFTFFTFTFTTTFFFFFTTFFTTTFTTTFTFFTTFFFTFTTFTTTFFFFFFTTFFFFTFFFTTFF"

  var ans_str = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"

  // var ans_str = "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"
  
  var ans_debug = ans_str.split("");


  function my_test() {
    // Change mouse pointer to wait indicator
    // This does not seem to work because JavaScript blocks the UI message pump :(
    // document.body.style.cursor = "wait";
  
    // Variable declarations
    let i, j, tscale, q, n, s, rp;
    let k, rawscore, kscore, tscore, percent;
    let t_cnt, f_cnt, cs_cnt, pe;


    let tscoreArray = [];
  
    // Make the scale and critical item tables
    let scale_table = make_table("Scale", "Scale Description", "Raw Score", "K Score", "T Score", "% Answered");
    let ci_table = make_table("Scale", "Scale Description", "Question", "Answer", "Question Text");
  
    // Count the number of True, False, and Can't Say answers
    n = longform ? questions.length : 371;
    t_cnt = 0;
    f_cnt = 0;
    cs_cnt = 0;
    for (q = 1; q < n; ++q) {
      switch (ans_debug[q]) {
        case "T":
          ++t_cnt;
          break;
        case "F":
          ++f_cnt;
          break;
        default:
          ++cs_cnt;
          break;
      }
    }
    --q;
  
    // Add T/F/? stats to scale table
    append_tr(scale_table, "True", " ", t_cnt, " ", " ", (t_cnt * 100 / q).toPrecision(3));
    append_tr(scale_table, "False", " ", f_cnt, " ", " ", (f_cnt * 100 / q).toPrecision(3));
    append_tr(scale_table, "?", " ", cs_cnt, " ", " ", (cs_cnt * 100 / q).toPrecision(3));
  
    // Score the TRIN/VRIN scales
    // Iterate the *RIN scales
    for (i = 0; i < rin.length; ++i) {
      // Start with default score
      rawscore = rin[i][0][2];
      // Iterate all the answer pairs
      for (j = 0; j < rin[i][1].length; ++j) {
        // Get reference to answer pair
        rp = rin[i][1][j];
        // If answers match, update the raw score
        if (ans_debug[rp[0]] === rp[1] && ans_debug[rp[2]] === rp[3]) {
          rawscore += rp[4];
        }
      }
      // Append results to scale table
      append_tr(scale_table, rin[i][0][0], rin_scale_description(rin[i][0][0], rin[i][0][1]), rawscore, " ", rin[i][2 + gender][rawscore], " ");
    }
  
    // Score the scales and critical items
    k = 0;
    pe = 0;
    // Iterate all the scales
    for (i = 0; i < scales.length; ++i) {
      n = 0;
      rawscore = 0;
      // Get the T score table, critcal items will not have this (undefined)
      tscale = scales[i][3 + gender];
      // Iterate the True question list
      for (j = 0; j < scales[i][1].length; ++j) {
        // Get the question number
        q = scales[i][1][j];
        // Act upon the answer to that question
        switch (ans_debug[q]) {
          // True
          case "T":
            // Increment the answer count
            ++n;
            // Increment raw score only if True
            ++rawscore;
            // If this is a critcal item, add it to the critical items table
            if (tscale === undefined) {
              append_tr(ci_table, scales[i][0][1], scales[i][0][2], q, "True", questions[q]);
            }
            break;
          case "F":
            // Increment the answer count
            ++n;
            break;
        }
      }
      // Iterate the False question list (same procedure as True above)
      for (j = 0; j < scales[i][2].length; ++j) {
        q = scales[i][2][j];
        switch (ans_debug[q]) {
          case "F":
            ++n;
            ++rawscore;
            if (tscale === undefined) {
              append_tr(ci_table, scales[i][0][1], scales[i][0][2], q, "False", questions[q]);
            }
            break;
          case "T":
            ++n;
            break;
        }
      }
      // Add scale results to scale table
      // T score table must be defined, otherwise this is a critical item
      if (tscale !== undefined) {
        // Capture K for future use
        if (scales[i][0][0] === "K") { k = rawscore; }
        // If there is a K correction, use it
        if (tscale[0]) {
          // Adjust with K
          kscore = k * tscale[0] + rawscore;
          // Round off and make integer
          kscore = Math.floor(kscore + 0.5);
          // T score lookup of corrected score
          tscore = tscale[kscore + 1];
          // No K correction
        } else {
          // K score is undefinded
          kscore = undefined;
          // T score lookup of raw score
          tscore = tscale[rawscore + 1];
        }
        // Calculate percent answered
        percent = n * 100 / (scales[i][1].length + j);
        // Append results to score table

        tscoreArray.push(tscore);

        append_tr(scale_table, scales[i][0][1], scales[i][0][2], rawscore, kscore === undefined ? " " : kscore, tscore, percent.toPrecision(3));
  
        // Update profile elevation for the 8 scales
        switch (scales[i][0][1]) {
          case "Hs":
          case "D":
          case "Hy":
          case "Pd":
          case "Pa":
          case "Pt":
          case "Sc":
          case "Ma":
            pe += tscore;
            break;
        }
      }
    }
    // Convert profile elevation sum to average (divide by number of scales)
    pe /= 8;
    // Show profile elevation in page
    append_text("Profile Elevation: " + pe.toPrecision(3));
  
    // Show an answer summary to allow for copy & paste of answers
    append_text("Answer Summary");
    s = "";
    for (q = 1; q < questions.length; ++q) {
      s += ans_debug[q];
      if (s.length >= 75) {
        append_text(s);
        s = "";
      }
    }
    if (s.length) { append_text(s); }
  
    // Restore mouse pointer
    document.body.style.cursor = "auto";

    start_to_creat_profile(tscoreArray);
  }

function start_to_creat_profile(tscoreArray){
  // 只换算图上的点；完整计分表继续显示美国查表 T 分。
  let cnTscoreArray = [];
  Object.keys(MMPI_CN.SCALE_INDEX).forEach(function (key) {
    const index = MMPI_CN.scaleIndex(key, gender);
    cnTscoreArray[index] = MMPI_CN.correctT(key, gender, tscoreArray[index]);
  });
  if(gender === 0){
    creat_trait_profile_1_male(cnTscoreArray);
  }
  else{
    creat_trait_profile_1_female(cnTscoreArray);
  }
  // 2026-09 修复：内容量表全部依赖 371 题以后的项目，短卷下无效，不予呈现
  if (longform) {
    creat_trait_profile_2(cnTscoreArray);
  } else {
    let _w = document.createElement("p");
    _w.style.color = "#FFD700";
    _w.style.textAlign = "center";
    _w.textContent = "您选择了短卷（前 370 题）。内容量表依赖第 371 题以后的项目，因此未予呈现。如需内容量表，请选择长卷重新作答。";
    resultTarget().appendChild(_w);
  }
  // creat_trait_profile_3();
}

/* 效度量表与临床量表的剖析图 */
function creat_trait_profile_1_female(tscoreArray){
  let data = {
    // labels: [scales[3][0][1], "一月", "二月", "三月", "四月", "五月", "六月"],
    // labels: scales,
    labels: [scales[3][0][1], scales[0][0][1], scales[4][0][1], scales[6][0][1], scales[7][0][1], scales[8][0][1], scales[9][0][1], scales[11][0][1], scales[12][0][1], scales[13][0][1], scales[14][0][1], scales[15][0][1], scales[16][0][1]],
    datasets: [
      {
        label: "中国常模近似 T 分",
        fill: false,
        lineTension: 0.025,
        borderRadius: 0,
        backgroundColor: "#FFFFFF",
        borderColor: "#FFFFFF",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        // data: [tscoreArray[3], 65, 59, 80, 81, 56, 55],
        // data: tscoreArray,
        data: [tscoreArray[3], tscoreArray[0], tscoreArray[4], tscoreArray[6], tscoreArray[7], tscoreArray[8], tscoreArray[9], tscoreArray[11], tscoreArray[12], tscoreArray[13], tscoreArray[14], tscoreArray[15], tscoreArray[16]],
      },
    ],
  };
  
  // 配置
  let options = {
    responsive: true,
    title: {
      display: true,
      text: "效度量表与临床量表（中国常模近似 T 分）",
      fontSize: 20,
      fontColor: "white"
    },
    scales: {
      // yAxes: [
      //   {
      //     ticks: {
      //       beginAtZero: true,
      //     },
      //   },
      // ],
      yAxes: [{
        gridLines: {
          // beginAtZero: true,
          color: '#B0C4DE',
          lineWidth: 1
        },
        ticks: {
          min: 30,
          fontSize: 14,
          fontColor: "white"
        },
      }],
      xAxes: [{
        gridLines: {
          color: '#B0C4DE',
          lineWidth: 1
        },
        ticks: {
          fontSize: 14,
          fontColor: "white"
        }
      }]
    },
  };
  
  // 创建图表
  let ctx = document.getElementById("myChart1").getContext("2d");
  let myChart1 = new Chart(ctx, {
    type: "line",
    data: data,
    // backgroundColor: "#FFFFFF",
    options: options,
  });
  profileCharts.push(myChart1);
}


function creat_trait_profile_1_male(tscoreArray){
  let data = {
    // labels: [scales[3][0][1], "一月", "二月", "三月", "四月", "五月", "六月"],
    // labels: scales,
    labels: [scales[3][0][1], scales[0][0][1], scales[4][0][1], scales[6][0][1], scales[7][0][1], scales[8][0][1], scales[9][0][1], scales[10][0][1], scales[12][0][1], scales[13][0][1], scales[14][0][1], scales[15][0][1], scales[16][0][1]],
    datasets: [
      {
        label: "中国常模近似 T 分",
        fill: false,
        lineTension: 0.025,
        borderRadius: 0,
        backgroundColor: "#FFFFFF",
        borderColor: "#FFFFFF",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        // data: [tscoreArray[3], 65, 59, 80, 81, 56, 55],
        // data: tscoreArray,
        data: [tscoreArray[3], tscoreArray[0], tscoreArray[4], tscoreArray[6], tscoreArray[7], tscoreArray[8], tscoreArray[9], tscoreArray[10], tscoreArray[12], tscoreArray[13], tscoreArray[14], tscoreArray[15], tscoreArray[16]],
      },
    ],
  };
  
  // 配置
  let options = {
    responsive: true,
    title: {
      display: true,
      text: "效度量表与临床量表（中国常模近似 T 分）",
      fontSize: 20,
      fontColor: "white"
    },
    scales: {
      // yAxes: [
      //   {
      //     ticks: {
      //       beginAtZero: true,
      //     },
      //   },
      // ],
      yAxes: [{
        gridLines: {
          // beginAtZero: true,
          color: '#B0C4DE',
          lineWidth: 1
        },
        ticks: {
          min: 30,
          fontSize: 14,
          fontColor: "white"
        },
      }],
      xAxes: [{
        gridLines: {
          color: '#B0C4DE',
          lineWidth: 1
        },
        ticks: {
          fontSize: 14,
          fontColor: "white"
        }
      }]
    },
  };
  
  // 创建图表
  let ctx = document.getElementById("myChart1").getContext("2d");
  let myChart1 = new Chart(ctx, {
    type: "line",
    data: data,
    // backgroundColor: "#FFFFFF",
    options: options,
  });
  profileCharts.push(myChart1);
}



/* 内容量表的剖析图 */
function creat_trait_profile_2(tscoreArray){
  let data = {
    // labels: [scales[3][0][1], "一月", "二月", "三月", "四月", "五月", "六月"],
    // ANX对应下标48，内容量表共15个条目，48 + 15 - 1 = 62
    labels: [scales[48][0][1], scales[49][0][1], scales[50][0][1], scales[51][0][1], scales[52][0][1], scales[53][0][1], scales[54][0][1], scales[55][0][1], scales[56][0][1], scales[57][0][1], scales[58][0][1], scales[59][0][1], scales[60][0][1], scales[61][0][1], scales[62][0][1]],
    datasets: [
      {
        label: "中国常模近似 T 分",
        fill: false,
        lineTension: 0.025,
        borderRadius: 0,
        backgroundColor: "#FFFFFF",
        borderColor: "#FFFFFF",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        // data: [tscoreArray[3], 65, 59, 80, 81, 56, 55],
        data: [tscoreArray[48], tscoreArray[49], tscoreArray[50], tscoreArray[51], tscoreArray[52], tscoreArray[53], tscoreArray[54], tscoreArray[55], tscoreArray[56], tscoreArray[57], tscoreArray[58], tscoreArray[59], tscoreArray[60], tscoreArray[61], tscoreArray[62]],
      },
    ],
  };
  
  // 配置
  let options = {
    responsive: true,
    title: {
      display: true,
      text: "内容量表（中国常模近似 T 分）",
      fontSize: 20,
      fontColor: "white"
    },
    scales: {
      // yAxes: [
      //   {
      //     ticks: {
      //       beginAtZero: true,
      //     },
      //   },
      // ],
      yAxes: [{
        gridLines: {
          // beginAtZero: true,
          color: '#B0C4DE',
          lineWidth: 1
        },
        ticks: {
          min: 30,
          fontSize: 14,
          fontColor: "white"
        },
      }],
      xAxes: [{
        gridLines: {
          color: '#B0C4DE',
          lineWidth: 1
        },
        ticks: {
          fontSize: 14,
          fontColor: "white"
        }
      }]
    },
  };
  
  // 创建图表
  let ctx = document.getElementById("myChart2").getContext("2d");
  let myChart2 = new Chart(ctx, {
    type: "line",
    data: data,
    // backgroundColor: "#FFFFFF",
    options: options,
  });
  profileCharts.push(myChart2);
}

// Debug...
var myArray = [
  ["apple", "苹果"],
  ["banana", "香蕉"],
  ["orange", "橙子"],
  ["grape", "葡萄"],
  ["watermelon", "西瓜"]
];

// 考虑：各量表名称是确定的，可以静态存到数组里面
// 得分可以人为分为高中低三档，在打表的时候用if判断
// 对应的量表名称可以用 + 的方式把分值给打进去
// 对每个量表，写三档评分，用if+数组下标弄出来
var resultArray = [
  ["L（装好）", 70, 40, "测验结果的有效性存疑；受测者可能在有意“装好”，对自己的描述过于完美无瑕；受测者可能对测验有抵触感；受测者可能否认自己有任何缺点，不愿意承认哪怕是极微小的缺点；不现实地夸大自己的优点，声称自己符合极高的道德准则", "测验结果有效；若L的T分大于60，则受测者可能采取了“自我防御”的反应定势；受测者可能过于保守、循规蹈矩，自我要求过高、标准僵化", "T分过低，测验结果可能存在“装坏”的成分；受测者过分强调异常和病态，或过分自信而独立"],
  ["F（装坏）", 71, 56, "测验效度存疑；受测者可能不配合；可能在“装坏”；可能未能理解题目意思，无意间夸大了自己的心理问题；或者是有各方面较严重的心理障碍；但若被试是青年人，则可能是存在自我认同危机", "测验结果可能有效；显示受测者不希望被认为是传统型的，或是有较强的政治、宗教、社会信仰；自我苛刻，或是回答问题时极度坦诚；也许存在一定程度的心理失常的问题", "测试结果是可接受的；受测者是顺从的、保守的；受测者可能在“装好”"],
  ["K（防御）", 71, 56, "表示受测者可能有很强的自我防御倾向；受测者可能在“装好”，也可能处于强烈的自我抑制当中，或是缺乏感情投入", "受测者有一定的自我防御倾向；受测者可能没有认识到或不承认自己存在心理问题；受测者十分独立，不愿意寻求帮助", "受测者自我防御倾向较低；受测者在“装坏”，又或者是对施测者极度坦诚"],
  ["Hs（疑病）", 65, 60, "T分高于65，高分，这反映出被测可能有以下部分（程度）的表现：过分关注身体；不清晰的躯体症状；胃部不适、疲劳、疼痛；自私、自我中心、自恋倾向；悲观、失败主义、愤世嫉俗的生活观；不满足、不愉快；诉苦、诉怨；需要他人关注、关心；对他人持批评态度；间接表达敌意；很少有失控行为；工作、学习效率降低，但无缺陷", "中等分，被测也许：关注自身的身体变化；常有不清晰具体位置的躯体不适；以自我为中心，对生活不满意；喜欢他人关注、关心；关注生活中的负性刺激", "低于平均的疑病水平，说明被试：也许不那么过分关注身体功能的问题，可能是自强、机敏、精力充沛的；也可能意味着受测者多以自己身体健康为傲，却忽略了疼痛、痛苦和疾患，直到问题变得相当严重；也许意味着抑郁情绪，反映了受测者对自己的身体健康不予关心、放任自流"],
  ["D（抑郁）", 65, 60, "T分高于65，高分，这反映出被测可能有以下部分（程度）的表现：抑郁，不愉快；对未来悲观失望；自卑，无自信；常有负罪感；懒散，软弱，易疲劳，精力不足；主诉许多躯体症状；易怒，紧张，内心难以松弛", "中等分，被测也许：易于担忧；自觉无用，无法适应外界，常有失败感；典型的内向性格，害羞、胆小、畏缩；孤独，与外界保持距离；避免与人交往；敬小慎微，循规蹈矩；难以做出决定；过分自控，不冲动，不具有侵犯性；为避免冲突而忍让；有参与心理治疗的动机", "低于平均的抑郁水平，说明被试：通常较为开朗；若分数低于45，则被试可能表现出警觉、开朗、积极、自信、有幽默感，被别人认为是热情和友善的"],
  ["Hy（癔症）", 65, 60, "T分高于65，高分，这反映出被测可能有以下部分（程度）的表现：以各种躯体症状的方式来应对刺激或逃避责任；有头痛、胸痛、乏力或贫血的症状；躯体症状常突然出现，又突然消失；对躯体症状的原因缺乏认识；表现出慢性焦虑、紧张及抑郁；极少有幻觉", "中等分，被测也许：心理上显得特别不成熟，孩子气；特别自我中心，有自恋倾向；期待他人的关注，要求得到他人的情感；采用间接方式获取他人注意", "低于平均的癔症水平，说明被试：通常较为积极、现实；若分数低于45，则被试可能表现出过分地现实、世故，让人感觉刻薄生硬；少数人愤世嫉俗，甚至憎恶世人，认为人生充满苦难；但该项低分往往反映出被试是现实主义者，表现出的敌意并非必要，只是应对方式过于生硬，缺乏礼貌或圆滑"],
  ["Pd（反社会）", 65, 60, "T分高于65，高分，这反映出被测可能有以下部分（程度）的表现：反社会行为；有抗拒权威人物的行为；家庭关系不和，常吵闹；将问题归咎于他人；学校成绩不良，工作表现不佳；有婚姻及其他人际关系问题；有冲动行为；做事没计划，不考虑结果，只图一时之满足；无耐性，对挫折的容忍度很低；判断力较差，乐于冒险；很难吃一堑长一智，不吸取经验教训", "中等分，被测也许：不成熟，孩子气及自我中心；常自我卖弄、自我炫耀；对他人的需求不敏感；倾向于利用他人获取自己的利益；开始时可能很讨人喜欢，但人际关系难以深入，大多是肤浅的；里不能与他人形成互相关怀的依附关系；外向、健谈，动作多，表情丰富、自然；缺乏明确的生活目标；具有敌意及侵犯性，好挖苦讽刺，玩世不恭，有怨恨及抗拒行为；行为常常有侵犯性；对于自己的不良行为很少有负罪感，只是在遇到麻烦时才自责；通常都不会有焦虑、抑郁及精神病症状；对生活不满意，感觉空虚和无聊；缺乏深刻的情绪体验；当然，也往往会表现出精力旺盛、社会化、进取、主动、努力等积极的人格特质", "T分低于平均，也许有精力旺盛、社会化、进取、主动、努力等积极的人格特质，但在遭遇挫折时也可能转换为愤怒；当T分过低时（低于45），则反映出受测者拘泥于常规、稳定的行为模式，倾向于消极与不自信，不尝试冒险，通常比较依赖他人，甚至非常僵化地坚持和遵守传统"],
  ["Mf（男性女性化或女性男性化）", "", "", ""],
  ["Pa（偏执）", 80, 60, "T分高于80，特高分，这反映出被测可能有以下部分（程度）的表现：明显的精神病患者行为，思维间断；被害妄想。或兼有自大妄想；关联妄想；认为自己被愚弄、被作践；易怒、不满、妒忌；常被诊断为精神分裂症或妄想状态", "若65≤T≤79，则反映出被测可能有以下部分（程度）的表现：具有妄想心理素质；对他人的行动过于敏感，常会反应过度；认为自己受到生活的不公平对待；常文过饰非，并责怪他人；多有怀疑、戒备他人的行为；对人怀有敌意，常不满他人而好争辩\n若60≤T≤64，则反映出被测可能有以下部分（程度）的表现：对人不友善，因不满他人而易发生冲突；常进行道德说教；过分强调理性。不愿意谈论情绪问题；与治疗者难以形成长期的互相信任的关系", "若36≤T≤59，则通常反应被测有着低于平均值的偏执水平；但对于更低的T分，则难以解释，必须综合其他因素判断，此处只能略过"],
  ["Pt（精神衰竭）", 80, 60, "T分高于80，特高分，这反映出被测可能有以下部分（程度）的表现：焦虑、紧张、易烦恼；坐卧不宁、担心、忧虑；神经过敏；精力难以集中；内省，常沉思，有强迫观念；有不安全感及自卑感；缺乏自信，怀疑自己；自我意识强、自我苛求、自我贬低", "若65≤T≤79，则反映出被测可能有以下部分（程度）的表现：僵化、常进行道德说教；对己对人的要求很高；过度追求完美和维护道德良心；有抑郁感和负罪感\n若60≤T≤64，则反映出被测可能有以下部分（程度）的表现：常关注事务的整洁、秩序以及细枝末节；坚持以一种固定不变的方式完成任务；常缩手缩脚，解决问题缺乏真诚及首创性；犹豫不决；小题大做；害羞，社交不良；让人难以理解，常担心自己是否能被他人接受、欢迎；有身体症状；对某些问题可能有较深入的了解；倾向于用理智化的方式思考问题", "若46≤T≤59，则通常反应被测有着低于平均值的精神衰竭水平；更低的Pt值反映受测者处于放松、舒适且没有感情忧伤的状态，他们大多自信、适应良好、活动高效且能干，能够没有压力地安排自己的生活，尽管有些受测者可能由于缺少必要的焦虑而显得生活没有动力"],
  ["Sc（精神分裂）", 70, 60, "若Sc的T分高于80且量表有效，则被试可能存在严重的妄想、幻觉；T分高于70时，被测可能有以下部分（程度）的表现：也许觉得自己并非社会整体的一部分；感觉孤独，与他人疏远，被他人误解；不被周围人所接受，退缩并自我封闭；情绪体验令人无法理解；逃避与他人的接触，避免陌生的环境；害羞、冷淡，对一切都不参与、不投入；也许伴有广泛焦虑综合征；不满、有敌意、有侵犯性；不能表达情感，以幻想及白日梦的方式来对外部应激状态进行反应；将现实与非现实混为一谈，无法加以区分；怀疑自己，自卑，没有竞争性；对性相当关注，性别角色混乱；处处与众不同，与常规相违背，以自我为中心；可能有长期的身体疾患；常常十分固执，喜怒无常，不成熟、冲动；缺少解决问题的基本常识；治疗预后不良，但能维持长时间的治疗", "Sc的T分较高，被测也许：生活方式与众不同；不合群，与他人疏远，保持距离；自卑、冷淡、兴趣索然；以幻想为主要的防御手段；经常做白日梦；不成熟，有自恋倾向；有冲动、侵犯行为及焦虑表现", "受测者很可能不存在精神方面的问题；若T分小于45，受测者很可能是比较有实际生活经验的，在行为与日常生活中比较保守，较少内省和思索；通常，该类被试是顺从的、尽责的、可靠的且谨慎的，但也可能会比较无趣和刻板严格"],
  ["Ma（轻躁狂）", 75, 60, "Ma的T分大于75，这反映出被测可能有以下部分（程度）的表现：过度活跃，或伴有极快频率的言语；有幻觉及自大妄想；情绪体验倒错；精力充足，谈话滔滔不绝；极端的自我欣赏；重行动，轻思考；不能聪明地运用自身能量，不能看透事情的结局；兴趣广泛，活动频繁，但对日常凡人、琐事的兴趣不高；对挫折的容忍度很低，很难抑制冲动，易激怒，有敌意及侵犯行为；常表现出没有现实根据、无原因的乐观态度；抱有不实际、夸大了的志向；夸大自我价值及自我重要性，看不到自身的局限性；开朗，善社交，喜欢集体活动；表现出阶段性焦躁不安或抑郁；抗拒心理治疗", "若65≤T≤74，则反映出被测可能有以下部分（程度）的表现：过分活跃；夸大自我价值，自恋；精力十足，讲话滔滔不绝，不加思考就采取行动；有广泛兴趣；不善于运用自身能量，做事虎头蛇尾；被人认为是有魄力、有主意的；对日常事务的兴趣不高；容易生厌及内心烦躁；对挫折的容忍度低；会冲动行事；也许曾有过被激怒、充满敌意地做出侵犯行为的情况；有时过分乐观；在某些方面自我夸大，看不到自身的局限性\n若60≤T≤64，则反映出被测可能有以下部分（程度）的表现：开朗、善社交、喜欢体育活动、愿意操纵和支配他人；常犯相同的错误；认为心理治疗是无必要的；会过早地结束疗程；当然，若被测是青年人，则也很可能暗示着一系列积极的特性，比如精力充沛、热情、开朗和活动能力强等", "若46≤T≤59，则通常反应被测有着低于平均值的轻躁狂水平；但若T分过低（45乃至35分以下），则可能表明：受测者正处于一种低精力水平、缺乏动力、倦怠的甚至是冷漠的状态（也许是疲劳或是生病，但更可能是预示其精力有限）；缺乏自信；可能面临着抑郁心境的困扰；可能年级较大（45岁以上），处于正常的衰老过程中"],
  ["Si（社交内向）", 70, 60, "高分，被试可能：社交内向；只有独处，或与少数好友相处时才能自然放松；害羞、保守、退缩；有异性存在时会感到不自然；很难让人了解；对他人如何评价自己很敏感", "若65≤T≤69，中等分，则被试可能：对与他人缺乏情感感到忧虑不安；过分自我控制；很少公开表露自己的情感；被动、服从、遵从权威；严肃、可靠、值得信赖、谨慎、保守、循规蹈矩；个人做事节奏慢\n若60≤T≤64，正常分，则被试可能：态度及观点僵硬、不灵活；即使做小事也难以下定决心；很容易忧心忡忡，感到自责", "T≤59，低分，被试可能：善社交，外向；开朗，喜欢集体生活，友善，健谈；很需要有人在其身边；与集体的关系融洽；富于表情，语言丰富，活跃，精力充沛；对地位、权力及名誉感兴趣；寻找竞争机会；有时难以控制冲动；会不计后果而采取行动；不成熟，自我放任；人际关系可能浮浅而不真诚；喜欢支配他人，人际关系忽冷忽热"],
  ["ANX（焦虑紧张）", "", "", ""],
  ["FRS（恐惧担心）", "", "", ""],
  ["OBS（强迫固执）", "", "", ""],
  ["DEP（抑郁空虚）", "", "", ""],
  ["HEA（关注健康）", "", "", ""],
  ["BIZ（怪异思维）", "", "", ""],
  ["ANG（愤怒失控）", "", "", ""],
  ["CYN（愤世嫉俗）", "", "", ""],
  ["ASP（反社会行为）", "", "", ""],
  ["TPA（A型行为）", "", "", ""],
  ["LSE（自我低估）", "", "", ""],
  ["SOD（社交不适）", "", "", ""],
  ["FAM（家庭问题）", "", "", ""],
  ["WRK（负面工作态度）", "", "", ""],
  ["TRT（负面治疗指标）", "", "", ""],
];

// 这个地方没写好……但是可以正确运行。注意与tscoreArray的下标对应关系
// 2026-09 修复：原数组把 Mf 的下标写死为 11（女性条目）。男性受测者会取 scales[11][3]，
// 那是个空数组，T 分恒为 undefined。
//
// 但这是个【潜伏缺陷，改动前对用户无可见影响】：两张结果表原本都有 if(i===7) continue
// 跳过 Mf（注释写的是"懒得打Mf的表了"），两张剖析图又各自用对了下标（女 11 / 男 10），
// 所以这个错误下标从未被读到。变量名叫 damn 大概就是当年撞上这个问题的痕迹。
//
// 本次修正了下标；另外把 Mf 放进了中国常模表（去掉了那个 continue）——
// 后者是新增行为，不是修 bug。
// 正确下标：10 = Masculinity-Femininity - Male，11 = ... - Female。
function damn_for_gender(g) {
  return [3, 0, 4, 6, 7, 8, 9, (g ? 11 : 10), 12, 13, 14, 15, 16];
}
var damn = damn_for_gender(0);

// damn 的顺序对应的量表代号，供中国常模换算查表用（见 origin_js/mmpi_cn_norms.js）
var CN_KEYS = ["L", "F", "K", "Hs", "D", "Hy", "Pd", "Mf", "Pa", "Pt", "Sc", "Ma", "Si"];

// 打表
// function start_to_print_result(tscoreArray){
function start_to_print_result(resultArray, tscoreArray, technicalTables){
  damn = damn_for_gender(gender);   // 2026-09 修复：按受测者性别取正确的 Mf 下标

  // 主结果只展示按中国样本统计量换算的近似 T 分；美国 T 分保留用于内部换算。
  let table2 = document.createElement("table");
  table2.style.borderCollapse = "collapse";
  table2.style.width = "80%";
  table2.style.tableLayout = "fixed";
  table2.setAttribute("border", "3");
  table2.style.margin = "auto";
  table2.setAttribute("bgcolor", "#B0C4DE");

  // 创建表头行
  let headerRow2 = document.createElement("tr");
  headerRow2.style.borderBottom = "2px solid black";
  table2.appendChild(headerRow2);

  // 创建表头单元格
  let header3 = document.createElement("th");
  header3.textContent = "中国常模近似 T 分";
  header3.style.padding = "8px";
  header3.style.width = "24%";
  header3.style.borderRight = "1px solid black";
  header3.style.color = "black";
  headerRow2.appendChild(header3);

  let header4 = document.createElement("th");
  header4.textContent = "基础解释";
  header4.style.padding = "8px";
  // 20240823尝试引入对“修正分”的描述 
  header4.style.color = "black";
  headerRow2.appendChild(header4);

  // 创建数据行和单元格
  for (let i = 0; i < 13; i++) {
    // 2026-09 重写：原逻辑为"当 T 分 >= 一级阈值时减 8，否则不动"。
    // 该做法有三个问题：(a) 全局常数 -8 在各量表上误差达 ±12 分，且 K / Mf(男) / Ma(女)
    // 方向是反的；(b) 有条件触发造成不连续且非单调 —— 原始分更高的人可能报出更低的 T 分；
    // (c) 无上下界钳位。现改为按已出版的中国全国常模做位置+离散度双参数仿射换算，
    // 依据见 origin_js/mmpi_cn_norms.js 的文件头。
    const __key = CN_KEYS[i];
    const __tUS = tscoreArray[damn[i]];
    const __tCN = (typeof MMPI_CN !== "undefined") ? MMPI_CN.correctT(__key, gender, __tUS) : null;
    const __cut = (typeof MMPI_CN !== "undefined") ? MMPI_CN.CUTOFF_CN : 60;

    let row = document.createElement("tr");
    row.style.borderTop = "1px solid black";
    table2.appendChild(row);

    let cell1 = document.createElement("td");
    cell1.style.padding = "8px";
    cell1.style.borderRight = "1px solid black";
    cell1.style.verticalAlign = "top";

    if (__tCN === null) {
      // 两种情况必须分开说，否则会误导使用者：
      //   (a) 美国常模 T 分本身算不出来 —— 原始分落在查表范围之外。
      //       美国常模表有地板与天花板：如男性 Mf 的最低可查原始分是 16（T=30），
      //       F 量表最高只查到原始分 28（T=120）。超出即无对应 T 分，这是原表的性质。
      //   (b) 该量表确实没有已出版的中国常模统计量（约 110 个量表属于此类）。
      const __noUS = (__tUS === undefined || __tUS === null || __tUS === "" || isNaN(Number(__tUS)));
      const __hasCNNorm = (typeof MMPI_CN !== "undefined") && MMPI_CN.hasNorm(__key);
      cell1.textContent = (i === 7 ? 'Mf（按' + (gender ? '女性' : '男性') + '计分）' : resultArray[i][0]) + " : "
        + (__noUS ? "超出量表范围" : "无中国常模数据");
      cell1.style.color = "#888888";
      row.appendChild(cell1);
      let c2 = document.createElement("td");
      c2.style.padding = "8px";
      c2.style.verticalAlign = "top";
      if (__noUS) {
        c2.textContent = "本量表的原始分落在美国常模查表的范围之外（过高或过低），"
          + "因此既无美国 T 分也无法换算中国 T 分。"
          + (__hasCNNorm ? "（本量表本身是有中国常模数据的。）" : "")
          + " 若您漏答较多，建议补全后重测。";
      } else {
        c2.textContent = "本量表尚无已出版的中国常模统计量，故不做换算。";
      }
      row.appendChild(c2);
      continue;
    }

    // 60仅作八个主要临床量表的换算参考线，不泛用于L/F/K、Mf或Si。
    const __elevated = ['Hs','D','Hy','Pd','Pa','Pt','Sc','Ma'].indexOf(__key) >= 0
      && MMPI_CN.correctT(__key, gender, __tUS, { round: false }) >= __cut;
    cell1.textContent = (i === 7 ? 'Mf（按' + (gender ? '女性' : '男性') + '计分）' : resultArray[i][0]) + " : " + __tCN;
    if (__elevated) { cell1.style.color = "red"; }
    row.appendChild(cell1);

    let cell2 = document.createElement("td");
    cell2.style.padding = "8px";
    cell2.style.verticalAlign = "top";
    // 保留作者原有的三档阈值和解释文字，仅把旧版有条件减8得到的分数
    // 换成当前计算出的近似中国 T 分，再按同一规则选档。
    if (i === 7) {
      cell2.textContent = 'Mf 量表使用与所选性别对应的计分表；本项目暂无此量表的单项解释文字。';
    } else if (__tCN >= resultArray[i][1]) {
      cell2.textContent = resultArray[i][3];
    } else if (__tCN >= resultArray[i][2]) {
      cell2.textContent = resultArray[i][4];
    } else {
      cell2.textContent = resultArray[i][5];
    }
    if (__elevated) {
      cell2.textContent = "【近似换算值达到 " + __cut + " 分参考线，不等于诊断】" + cell2.textContent;
    }
    row.appendChild(cell2);
  }


  // 创建注释性文字元素
  var span = document.createElement('span');
  var span2 = document.createElement('span2');
  var span3 = document.createElement('a');
  var text = document.createTextNode('中国常模近似T分表按 Cheung, Song & Zhang (1996) 表6-3的中国样本统计量换算，并非官方中国常模查表结果。该表给出男1106人、女1108人在美国常模尺度上的均值与标准差。两参数换算不能验证个人分数或临床分界点的准确性，也不能弥补本项目译文与正版译文不同的影响。');
  var text2 = document.createTextNode('注意！结果仅供参考！');
  span3.textContent = '查看常模换算的依据、验证过程与已知局限';
  span3.href = 'https://github.com/MMPI-CHN/MMPI-CHN.github.io/blob/main/docs/%E6%8E%A2%E7%B4%A2%E7%BA%AA%E8%A6%81-TLDR.md';
  span3.target = '_blank';
  span3.rel = 'noopener noreferrer';
  span.appendChild(text);

  span2.appendChild(text2);
  
  var span4 = document.createElement('span4');
  var text4 = document.createTextNode('如果有需要，可以保留您的原始选项。您做出的选择是（0代表male 1代表female）：' + gender.toString() + ans);
  span4.appendChild(text4);

  // 设置文字样式
  span.style.display = 'block'
  span.style.textAlign= 'center'; // 设置居中对齐
  span.style.color = "#87CEEB";
  span.style.fontFamily = 'KaiTi'; // 设置字体为楷体
  span.style.fontSize = '16px';
  span.style.maxWidth = '1100px';
  span.style.margin = '0 auto';
  span.style.padding = '0 16px';
  span.style.lineHeight = '1.65';
  span2.style.display = 'block'
  span2.style.textAlign= 'center'; // 设置居中对齐
  span2.style.color = "red"; // 设置文字颜色
  span2.style.fontFamily = 'KaiTi'; // 设置字体为楷体
  span2.style.fontSize = '24px';

  span3.style.display = 'block'
  span3.style.textAlign= 'center'; // 设置居中对齐
  span3.style.color = "#87CEEB";
  span3.style.fontFamily = 'KaiTi'; // 设置字体为楷体
  span3.style.maxWidth = '1100px';
  span3.style.margin = '0 auto';
  span3.style.padding = '0 16px';
  span3.style.lineHeight = '1.65';
  span3.style.textDecoration = 'underline';

  span4.style.display = 'block'
  span4.style.textAlign= 'center'; // 设置居中对齐
  span4.style.color = "#B0C4DE"; // 设置文字颜色
  span4.style.fontFamily = 'KaiTi'; // 设置字体为楷体
  span4.style.wordWrap = 'break-word'; // 允许在单词内换行
  span4.style.overflowWrap = 'anywhere';
  span4.style.maxWidth = '1100px';
  span4.style.boxSizing = 'border-box';
  span4.style.margin = '0 auto';
  span4.style.padding = '0 16px';
  span4.style.lineHeight = '1.65';
  
  // 将表格添加到页面中
  // 插入三个空白行
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(document.createElement('br'));

  resultTarget().appendChild(span);
  resultTarget().appendChild(span2);
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(span3);

  // 插入三个空白行
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(document.createElement('br'));

  resultTarget().appendChild(table2);

  // 插入三个空白行
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(document.createElement('br'));
  resultTarget().appendChild(document.createElement('br'));

  if (technicalTables) {
    resultTarget().appendChild(technicalTables);
    resultTarget().appendChild(document.createElement('br'));
    resultTarget().appendChild(document.createElement('br'));
  }
  resultTarget().appendChild(span4);

}

// 2023.5.26添加了一个移动端的简单提示信息。
function showModalInThePhone(){
  // 创建一个包含自定义内容的 div 元素
  var modalContent = document.createElement("div");
  modalContent.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="hideModal()"></span>
      <h1>重要提示</h1>
      <p>1、本网页的开发是基于桌面浏览器的，我已经尽量适配移动端了；若您目前使用的是手机等移动端设备，可能会显示该提示信息。在PC端，此处显示的应是一些关于重要的信息。虽然您可以在移动端正常完成整个测试并拿到结果，但排版并没有PC端漂亮，而且您也漏看了“测试须知”。我们强烈建议您使用桌面浏览器进行该测试。</p>
      <p>2、本测验完全<b>免费</b>，不存在花钱买报告的情况。本项目由我独自开发，如果觉得做得还行，看完剖析图和报告后可以捐点钱给我买游戏 :D</p>
      <p>3、主页的黑猫你找到了吗 :( meow~meow~meow~~ :D</p>
      <input class="my_button" type="button" value="我已认真阅读并知晓，可以开始测验" onclick="hideModal();">
    </div>
  `;

  // 创建一个包含背景和提示框内容的 div 元素
  var modal = document.createElement("div");
  modal.className = "modal";
  modal.appendChild(modalContent);

  // 将提示框添加到页面中
  document.body.appendChild(modal);
}

function showModal() {
  // 创建一个包含自定义内容的 div 元素
  var modalContent = document.createElement("div");
  modalContent.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="hideModal()"></span>
      <h1>重要提示</h1>
      <p>0、请勿空题！虽然该量表在设计时允许空题，但是这会产生蝴蝶效应，使得量表对于没有阅读障碍的被试的可信度大大降低。另外，若能理解英文题干（并转化至中文语境），最好不要看中文。MMPI-2的567题版本通常需要40分钟以上完成。</p>
      <p>1、本地版本不会把作答结果发送到第三方服务。完成后请点击<b>提交测试</b>按钮，在当前页面查看结果（建议截图保存）。</p>
      <p>2、请认真对待该测验；MMPI是少有的具有完整理论与多年实践的专业（人格）量表，可以帮助您更好地认识自己。需要注意的是，由于该量表常用于临床，因此它主要着眼于您“<b>也许</b>存在的问题”以及“<b>也许</b>拥有的人格特质”，而非像16pf之类的量表尝试将您划分为“某种人格”。</p>
      <p>3、该量表的结果（真的真的）仅供参考；这是因为，虽然本网站根据您的选择计算得到的一致性T分是准确的，但是由于诸多限制，给出的解释是十分贫瘠且有限的。现实中，对该量表做出解释高度依赖于被试的态度、职业，以及一些特殊情景（如近期事件）等；若您希望获得更详细的解答，可以保存我们给出的量表的剖析图，并在日后咨询专业人士。</p>
      <p>4、点击<b>提交测试</b>后，您将得到：两张人格剖析图、您作答的原始数据以及一些关键选项（均供专业人士使用；建议您保存以待后用），以及一份简略的解释；正如<b>2</b>所言，请勿过分较真。</p>
      <p>5、本测验完全<b>免费</b>，不存在花钱买报告的情况。本项目由我独自开发，如果觉得做得还行，看完剖析图和报告后可以捐点钱给我买游戏 :D</p>
      <p>6、主页的黑猫你找到了吗 :( meow~meow~meow~~ :D</p>
      <input class="my_button" type="button" value="我已认真阅读并知晓，可以开始测验" onclick="hideModal();">
    </div>
  `;


  
  // 创建一个包含背景和提示框内容的 div 元素
  var modal = document.createElement("div");
  modal.className = "modal";
  modal.appendChild(modalContent);
  
// //  滑动？？？ 
// modal.addEventListener("touchmove", function(e) {
//   e.stopPropagation();
// }, false);


  // 将提示框添加到页面中
  document.body.appendChild(modal);
  
}

function hideModal() {
  // 隐藏提示框
  var modal = document.querySelector(".modal");
  document.body.removeChild(modal);
}




function selectAll() {
  // 获取表单元素
  const form = document.getElementById("select_all");

  // 选中所有表单元素中的值
  let inputs = form.querySelectorAll("input[type=\"radio\"]");
  // let value = "T";

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].checked = true;
  }
}

// GPT牛逼
// var form = document.getElementById("myForm");
// var inputs = form.querySelectorAll('input[type="radio"]');
// var value = "male";

// for (var i = 0; i < inputs.length; i++) {
//   if(inputs[i].value === value){
//     inputs[i].checked = true;
//     break;
//   }
// }



// 20240514 尝试在POST的时候进行检查，以减少无用表项的收集。
// 定义validateForm函数，用于在提交表单前进行验证
var ans_dummy = []

function score_rb_dummy(){
  var form = document.getElementById('select_all');
  ans_dummy = [undefined];
    for (let i = 1; i < questions.length; ++i) {
      let rbv = radio_value(form.elements["Q" + i]);
      if (rbv) {
        ans_dummy.push(rbv);
      } else {
        ans_dummy.push("?");
      }
    }
    // done...
}


function validateForm() {
  // 假设我们有两个变量，分别代表值为'T'和'F'的项
  var countT = 0; // 用于计数值为'T'的项
  var countF = 0; // 用于计数值为'F'的项
  var countEmpty = 0; // 用于计数空值的项

  var num_of_void = 0;

  // // 使用表单的id选择表单
  // var form = document.getElementById('select_all');
  // for (var i = 0; i < form.elements.length; i++) {
  //     var element = form.elements[i];
  //     // 确保只检查需要的输入项类型
  //     if (element.type !== 'hidden' && element.type !== 'submit' && element.type !== 'button') {
  //         // 检查输入值
  //         if (element.value === 'T') {
  //             countT++;
  //         } else if (element.value === 'F') {
  //             countF++;
  //         } else if (element.value === '') {
  //             countEmpty++;
  //         }
  //     }
  // }

  // 他给的好像是在乱搞……只是把所有选项都给统了一遍，根本没有统值

  // 不太行，会有连锁反应。先来个蠢驴版本吧，能用就行。
  // 还是要从全局变量ans入手
  // ……但是他妈的，这个ans好像必须要计分之后才会有效  
  // if(ans[0] === ''){
  // var form = document.getElementById('select_all');
  // score_rb(form)
  // }

  score_rb_dummy();

  // for (var i = 0; i < form.elements.length; i++){
  for(var i = 0; i < ans_dummy.length; i++){
    if(ans_dummy[i] === 'T'){
      countT++;
    }else if(ans_dummy[i] === 'F'){
      countF++;
    }else if(ans_dummy[i] = '?'){
      countEmpty++;
    }
  }

  num_of_void = ans_dummy.length - countT - countF;

  // 根据您提供的规则进行检查
  if (countT > 550 || countF > 550 || countEmpty > 550 || num_of_void > 550) {
      alert("提交失败：某个条件超过了限制。（1）值为T的大于550项（2）值为F的大于550项（3）空值超过550项");
      return false; // 阻止表单提交
  }

  // 如果所有检查都通过，允许表单提交
  return true;
}



// 20240514 一劳永逸，尝试模拟点击
// 妈的，gpt搞的……我的每一行都有两个ratio T一个 F一个，所以这个遍历实际上有些问题……
function clickAllToT(formId) {
  // 使用提供的formId获取表单
  var form = document.getElementById(formId);
  if (form) {
      // 遍历表单中的所有元素
      for (var i = 0; i < form.elements.length; i++) {
          var element = form.elements[i];
          // 检查元素是否为单选按钮
          if (element.type === 'radio') {
              // 如果单选按钮的值为"T"，则选中它
              if (element.value === 'T') {
                  element.checked = true;
              }
          }
      }
  } else {
      console.log('表单ID无效或未找到表单元素。');
  }
}

function clickAllToF(formId) {
  // 使用提供的formId获取表单
  var form = document.getElementById(formId);
  if (form) {
      // 遍历表单中的所有元素
      for (var i = 0; i < form.elements.length; i++) {
          var element = form.elements[i];
          // 检查元素是否为单选按钮
          if (element.type === 'radio') {
              // 如果单选按钮的值为"F"，则选中它
              if (element.value === 'F') {
                  element.checked = true;
              }
          }
      }
  } else {
      console.log('表单ID无效或未找到表单元素。');
  }
}

function clickRandomToTOrF(formId) {
  // 使用提供的formId获取表单
  var form = document.getElementById(formId);
  if (form) {
      // 每道题只抽样一次；逐个radio抽样会偏向后面的F，且可能漏答。
      var choices = {};
      for (var i = 0; i < form.elements.length; i++) {
          var element = form.elements[i];
          // 检查元素是否为单选按钮
          if (element.type === 'radio' && /^Q\d+$/.test(element.name)) {
              // 生成一个随机数，随机选择T或F
              if (!Object.prototype.hasOwnProperty.call(choices, element.name))
                  choices[element.name] = Math.random() > 0.5 ? 'T' : 'F';
              var randomValue = choices[element.name];
              // var randomValue = (i % 2 === 0) ? 'T' : 'F';
              element.checked = element.value === randomValue;
          }
      }
  } else {
      console.log('表单ID无效或未找到表单元素。');
  }
}
