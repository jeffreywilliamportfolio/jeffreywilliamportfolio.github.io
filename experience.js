(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const gsap = window.gsap;
  const Draggable = window.Draggable;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(window.location.search);
  const body = document.body;
  const announcer = $("#announcer");
  const conversation = $("#conversation");
  const toolSpace = $("#tool-space");
  const finder = $("#finder");
  const documentTool = $("#document-tool");
  const visited = new Set();
  let sessionState = "opening";
  let toolHasOpened = false;
  let finderWasDragged = false;
  let activeRegion = null;
  let activeArtifact = null;

  if (gsap && Draggable) gsap.registerPlugin(Draggable);

  const prompt = $("#prompt-input").value.trim();
  const reasoningText = "The user wants help assembling an up-to-date portfolio for AI interpretability positions. Searching careers could be useful later, but that is not what he asked for. He asked me to understand his recent work first.\n\nI need to begin with the record on his machine.";
  const responseText = "Jeffrey—this is great. I found your earlier résumé as well as the recent work you’ve done. First, congratulations. You’ve built a considerable body of research. And the arc—from audio engineer in Nashville, to being promoted internally into Progressive Insurance’s first dedicated AI role, to independent mechanistic interpretability researcher—is remarkable. I reviewed Progressive’s public openings from 2023 and couldn’t find a matching role. I can help you shape this.";

  const regionData = {
    research: {
      heading: "Research Highlights",
      thought: "The strongest pattern is not a single result. It is Jeffrey’s willingness to let a better control break the clean story.",
      inspector: {
        kicker: "RESEARCH BEHAVIOR",
        title: "He keeps the contradiction.",
        copy: "Papers, datasets, and corrections remain together. The failed explanation is not hidden; it becomes the next instrument.",
        facts: [["mode", "evidence-first"], ["signature", "self-correction"]]
      },
      artifacts: ["confound"],
      files: [
        { title: "Self-Copy Regime", meta: "Zenodo paper · Hugging Face data", type: "PDF", kind: "pdf", tag: "paper" },
        { title: "Survival of the Fitted", meta: "Jacobian Lens transfer · dataset linked", type: "PDF", kind: "pdf", tag: "★ fitted lens" },
        { title: "Minimum Perturbation in Jacobian Space", meta: "safety continuations · working draft", type: "TEX", kind: "data", tag: "unfinished" },
        { title: "A Note for Those Doing Routing Research", meta: "position confound · correction record", type: "PDF", kind: "pdf", tag: "★ confound", artifact: "confound" },
        { title: "DMRA", meta: "dialect bias safety-audit protocol", type: "PDF", kind: "pdf", tag: "paper" }
      ]
    },
    recent: {
      heading: "Recent Work",
      thought: "When an existing representation cannot hold the question, Jeffrey does not simplify the question. He builds another way to see it.",
      inspector: {
        kicker: "CURRENT EDGE",
        title: "The question becomes an interface.",
        copy: "Probes turn into visual instruments; informal findings remain connected to raw runs; unfinished work stays visibly unfinished.",
        facts: [["mode", "instrument-building"], ["state", "actively moving"]]
      },
      artifacts: ["mindvolume"],
      files: [
        { title: "MindVolume", meta: "J-Space vocabulary visualizer", type: "APP", kind: "app", tag: "instrument", artifact: "mindvolume" },
        { title: "Banana In, Bostrom Out", meta: "LessWrong field note", type: "POST", kind: "post", tag: "essay" },
        { title: "Sparse Autoencoder Feature Findings", meta: "informal findings write-up", type: "TXT", kind: "data", tag: "notes" },
        { title: "Deictic Routing Effects", meta: "routing changes by addressee", type: "NPY", kind: "data", tag: "study" },
        { title: "HackerOne Submission", meta: "private security disclosure", type: "SEC", kind: "sec", tag: "private" },
        { title: "Diacritic Token Modulation", meta: "deterministic-decoding paper", type: "TEX", kind: "data", tag: "draft" },
        { title: "Expert E114", meta: "readout · intervention · residual analysis", type: "NPY", kind: "data", tag: "program" }
      ]
    },
    career: {
      heading: "Career Showcase",
      thought: "Before interpretability, the same instinct was already present: translate difficult human problems into systems people can actually use.",
      inspector: {
        kicker: "CONTINUOUS ARC",
        title: "The subject changes. The behavior does not.",
        copy: "Community work becomes a parenting product. Research operations become an agent system. A disaster-help pilot becomes an internal AI role.",
        facts: [["mode", "human → system"], ["arc", "audio → AI research"]]
      },
      artifacts: ["community", "gift", "brilliance"],
      files: [
        { title: "Gift Connect Parenting App", meta: "React Native · Swift · Firebase · generation", type: "APP", kind: "app", tag: "2025–26", artifact: "gift" },
        { title: "Brilliance Research Platform", meta: "Heroku · Redis/Celery · research agents", type: "SYS", kind: "data", tag: "2024", artifact: "brilliance" },
        { title: "Progressive’s First AI Prompt Engineer Role", meta: "Azure · RAG · SQL · disaster-help pilot", type: "AI", kind: "app", tag: "2023", artifact: "community" }
      ]
    }
  };

  const artifactData = {
    confound: {
      image: "assets/position-confound.png",
      kicker: "MARCH 05 · METHODOLOGICAL CORRECTION",
      title: "The replication was real. It replicated the confound.",
      copy: "A compelling routing-entropy hierarchy survived replication, then disappeared when Jeffrey matched token position. The correction became more important than the original headline.",
      source: "Position-confound record · DeepSeek V3.1 + Qwen 397B"
    },
    mindvolume: {
      image: "assets/mindvolume-field.webp",
      kicker: "INSTRUMENT · VOCABULARY SPACE",
      title: "When the table ran out of dimensions, he opened it.",
      copy: "MindVolume turns a flat readout into a spatial field. It is not the portfolio metaphor; it is evidence of the reflex to build a missing view when the available one cannot hold the question.",
      source: "MindVolume working capture · July 2026"
    },
    community: {
      image: "assets/community-field.webp",
      kicker: "ORIGIN · HUMAN CONTEXT",
      title: "The systems begin with people, not technology.",
      copy: "The nonprofit and product work is not a prelude to the research. It reveals the same underlying concern: make complex systems answerable to the humans inside them.",
      source: "Gift Connect field context · Zambia"
    },
    gift: {
      image: "assets/gift-play.webp",
      kicker: "PRODUCT · 2025–2026",
      title: "Research translated into something a family can use.",
      copy: "Gift Connect combines parenting research, voice, music and image generation, mobile engineering, and measurement into one practical system.",
      source: "Gift Connect Parenting App · production asset"
    },
    brilliance: {
      image: "assets/brilliance-pipeline.png",
      kicker: "SYSTEM · 2024",
      title: "A research question becomes an operating system.",
      copy: "Brilliance coordinated agents, queues, tools, and evidence long before Jeffrey’s interpretability work. The architecture is another trace of how he thinks.",
      source: "Brilliance research pipeline · system map"
    }
  };

  const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, reducedMotion ? Math.min(milliseconds, 18) : milliseconds);
  });

  const announce = (message) => {
    announcer.textContent = "";
    window.setTimeout(() => { announcer.textContent = message; }, 20);
  };

  const setSessionStatus = (text) => {
    $("#session-status").textContent = text;
  };

  const scrollConversation = () => {
    conversation.scrollTo({ top: conversation.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const reveal = (element, vars = {}) => {
    element.hidden = false;
    element.setAttribute("aria-hidden", "false");
    if (!gsap || reducedMotion) {
      element.classList.add("is-visible");
      element.style.opacity = "1";
      element.style.transform = "none";
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      gsap.fromTo(element,
        { autoAlpha: 0, y: vars.y ?? 18, scale: vars.scale ?? 1 },
        { autoAlpha: 1, y: 0, scale: 1, duration: vars.duration ?? .72, ease: "power3.out", onStart: () => element.classList.add("is-visible"), onComplete: resolve }
      );
    });
  };

  const typeText = async (element, text, delay = 8) => {
    element.textContent = "";
    element.classList.add("is-streaming");
    if (reducedMotion) {
      element.textContent = text;
      element.classList.remove("is-streaming");
      return;
    }
    for (let index = 0; index < text.length; index += 1) {
      element.textContent += text[index];
      if (index % 3 === 0) {
        if (index % 42 === 0) scrollConversation();
        await wait(delay * 3);
      }
    }
    element.classList.remove("is-streaming");
  };

  const beginSession = async () => {
    if (sessionState !== "opening") return;
    sessionState = "reasoning";
    body.dataset.state = "reasoning";
    $("#prompt-input").disabled = true;
    $("#send-button").disabled = true;
    $("#restart-button").hidden = false;
    setSessionStatus("reasoning live");

    if (gsap) {
      gsap.to("#opening-space", { autoAlpha: 0, duration: .45, ease: "power2.out" });
      gsap.to("#composer-wrap", { autoAlpha: 0, y: 30, duration: .6, ease: "power3.inOut", onComplete: () => { $("#composer-wrap").hidden = true; } });
    } else {
      $("#opening-space").hidden = true;
      $("#composer-wrap").hidden = true;
    }

    $("#user-message-text").textContent = prompt;
    await reveal($("#user-message"));
    await wait(240);
    await reveal($("#reasoning-message"));
    scrollConversation();
    await typeText($("#reasoning-copy"), reasoningText, 7);
    $("#reasoning-status").textContent = "a tool can open this interface";

    const bench = $("#tool-bench");
    bench.hidden = false;
    if (gsap && !reducedMotion) gsap.fromTo($$(".tool-chip"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .42, stagger: .08, ease: "power2.out" });
    documentTool.disabled = false;
    documentTool.classList.add("is-ready");
    documentTool.setAttribute("aria-expanded", "false");
    $("#document-tool-state").textContent = "open tool space";
    $("#tool-instruction").hidden = false;
    announce("Document reader is ready. Open the tool space to continue.");
    scrollConversation();
  };

  const setToolOrigin = () => {
    const rect = documentTool.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2 - 68) / Math.max(1, window.innerWidth - 68)) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    toolSpace.style.setProperty("--origin-x", `${Math.max(0, Math.min(100, x))}%`);
    toolSpace.style.setProperty("--origin-y", `${Math.max(0, Math.min(100, y))}%`);
  };

  const initDraggable = () => {
    if (!Draggable || finder._draggableReady || window.innerWidth <= 820) return;
    finder._draggableReady = true;
    Draggable.create(finder, {
      trigger: "#finder-drag-handle",
      bounds: toolSpace,
      edgeResistance: .82,
      cursor: "grab",
      activeCursor: "grabbing",
      onDragStart() { finderWasDragged = true; },
      onDrag() {
        const rotation = Math.max(-1.2, Math.min(1.2, this.deltaX * .035));
        gsap.set(finder, { rotation });
      },
      onDragEnd() { gsap.to(finder, { rotation: 0, duration: .5, ease: "power2.out" }); }
    });
  };

  const openToolSpace = async () => {
    if (sessionState === "opening") return;
    if (body.classList.contains("tool-open")) return;
    setToolOrigin();
    toolSpace.inert = false;
    toolSpace.setAttribute("aria-hidden", "false");
    toolSpace.style.visibility = "visible";
    body.classList.add("tool-open");
    sessionState = "tool";
    body.dataset.state = "tool";
    documentTool.classList.remove("is-ready");
    documentTool.setAttribute("aria-expanded", "true");
    $("#document-tool-state").textContent = "connected";
    setSessionStatus("inside document_reader");

    if (gsap && !reducedMotion) {
      await new Promise((resolve) => {
        gsap.fromTo(toolSpace,
          { clipPath: `circle(0px at ${getComputedStyle(toolSpace).getPropertyValue("--origin-x")} ${getComputedStyle(toolSpace).getPropertyValue("--origin-y")})` },
          { clipPath: "circle(150vmax at var(--origin-x) var(--origin-y))", duration: 1.25, ease: "power4.inOut", onComplete: resolve }
        );
        gsap.fromTo(finder, { autoAlpha: 0, scale: .74, y: 70 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.05, delay: .25, ease: "power4.out" });
        gsap.fromTo("#live-reasoning", { autoAlpha: 0, x: 35 }, { autoAlpha: 1, x: 0, duration: .7, delay: .65, ease: "power3.out" });
      });
    } else {
      toolSpace.style.clipPath = "circle(150vmax at var(--origin-x) var(--origin-y))";
    }

    toolHasOpened = true;
    initDraggable();
    announce("You are inside the document reader. Choose one of Jeffrey’s three working regions.");
  };

  const collapseToolSpace = async () => {
    if (!body.classList.contains("tool-open")) return;
    if (gsap && !reducedMotion) {
      await new Promise((resolve) => {
        gsap.to(toolSpace, { clipPath: "circle(0px at var(--origin-x) var(--origin-y))", duration: .82, ease: "power3.inOut", onComplete: resolve });
      });
    }
    body.classList.remove("tool-open", "is-synthesizing");
    toolSpace.inert = true;
    toolSpace.setAttribute("aria-hidden", "true");
    toolSpace.style.visibility = "hidden";
    sessionState = $("#final-message").hidden ? "reasoning" : "complete";
    body.dataset.state = sessionState;
    documentTool.classList.add("is-ready");
    documentTool.setAttribute("aria-expanded", "false");
    $("#document-tool-state").textContent = "re-enter tool space";
    setSessionStatus(sessionState === "complete" ? "synthesis complete" : "tool paused · thread live");
    scrollConversation();
  };

  const fileButton = (file, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "file-row";
    button.dataset.index = String(index);
    if (file.artifact) button.dataset.artifact = file.artifact;

    const icon = document.createElement("span");
    icon.className = `file-type ${file.kind}`;
    icon.textContent = file.type;
    const copy = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = file.title;
    const meta = document.createElement("small");
    meta.textContent = file.meta;
    copy.append(title, meta);
    const tag = document.createElement("em");
    tag.textContent = file.tag;
    button.append(icon, copy, tag);
    return button;
  };

  const updateInspector = (region, file = null) => {
    const data = regionData[region];
    const inspector = data.inspector;
    $("#inspector-kicker").textContent = file ? `${inspector.kicker} / SELECTED` : inspector.kicker;
    $("#inspector-title").textContent = file?.title || inspector.title;
    $("#inspector-copy").textContent = file ? file.meta : inspector.copy;
    const facts = file ? [["kind", file.tag], ["region", data.heading]] : inspector.facts;
    const list = $("#inspector-facts");
    list.replaceChildren();
    for (const [term, value] of facts) {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = value;
      row.append(dt, dd);
      list.appendChild(row);
    }
    if (gsap && !reducedMotion) gsap.fromTo("#finder-inspector > *", { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .04, ease: "power2.out" });
  };

  const hideArtifacts = () => {
    const currentlyActive = $$(".artifact.is-active");
    currentlyActive.forEach((artifact) => {
      artifact.classList.remove("is-active");
      artifact.setAttribute("aria-hidden", "true");
      artifact.tabIndex = -1;
    });
    if (gsap && currentlyActive.length) gsap.to(currentlyActive, { autoAlpha: 0, y: 25, duration: .42, ease: "power2.in" });
    else currentlyActive.forEach((artifact) => { artifact.style.opacity = "0"; });
  };

  const showArtifacts = (names) => {
    hideArtifacts();
    const artifacts = names.map((name) => $(`.artifact[data-artifact="${name}"]`)).filter(Boolean);
    artifacts.forEach((artifact) => {
      artifact.classList.add("is-active");
      artifact.setAttribute("aria-hidden", "false");
      artifact.tabIndex = 0;
    });
    if (gsap && !reducedMotion) {
      gsap.fromTo(artifacts,
        { autoAlpha: 0, y: 38, scale: .94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: .9, stagger: .12, ease: "power3.out" }
      );
    } else {
      artifacts.forEach((artifact) => { artifact.style.opacity = "1"; artifact.style.transform = "none"; });
    }
  };

  const moveFinderForRegion = (region) => {
    if (!gsap || finderWasDragged || window.innerWidth <= 820) return;
    const positions = {
      research: { x: 105, y: 118 },
      recent: { x: -95, y: -70 },
      career: { x: 70, y: 65 }
    };
    gsap.to(finder, { ...positions[region], duration: 1.05, ease: "power3.inOut" });
  };

  const selectRegion = (region, options = {}) => {
    if (!regionData[region]) return;
    activeRegion = region;
    const data = regionData[region];
    visited.add(region);
    $$(".region-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.region === region);
      if (visited.has(button.dataset.region)) button.classList.add("is-visited");
    });

    $("#files-heading").textContent = data.heading;
    $("#files-count").textContent = `${data.files.length} items`;
    const list = $("#file-list");
    list.replaceChildren(...data.files.map(fileButton));
    const rows = $$(".file-row", list);
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        rows.forEach((candidate) => candidate.classList.remove("is-active"));
        row.classList.add("is-active");
        const file = data.files[Number(row.dataset.index)];
        updateInspector(region, file);
        if (file.artifact) {
          const artifact = $(`.artifact[data-artifact="${file.artifact}"]`);
          if (artifact && gsap) gsap.fromTo(artifact, { filter: "brightness(1.45)" }, { filter: "brightness(1)", duration: .8, ease: "power2.out" });
        }
      });
    });

    updateInspector(region);
    $("#field-thought").textContent = data.thought;
    $("#finder-status").textContent = `${data.files.length} items · ${visited.size} region${visited.size === 1 ? "" : "s"} understood`;
    $("#visited-count").textContent = `${visited.size} of 3 regions opened`;
    if (gsap) {
      gsap.to("#progress-fill", { width: `${visited.size / 3 * 100}%`, duration: .7, ease: "power2.out" });
      if (!reducedMotion) gsap.to(rows, { autoAlpha: 1, y: 0, duration: .45, stagger: .045, ease: "power2.out" });
      else gsap.set(rows, { autoAlpha: 1, y: 0 });
      gsap.fromTo("#field-thought", { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: .45 });
    } else rows.forEach((row) => { row.style.opacity = "1"; row.style.transform = "none"; });

    showArtifacts(data.artifacts);
    moveFinderForRegion(region);

    if (visited.size === 3 && $("#synthesize-button").hidden) {
      const synth = $("#synthesize-button");
      synth.hidden = false;
      if (gsap && !reducedMotion) gsap.fromTo(synth, { autoAlpha: 0, y: 22, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .65, ease: "back.out(1.4)" });
      announce("All three regions are open. You can synthesize what they mean.");
    } else announce(`${data.heading} opened. ${data.files.length} items are available to inspect.`);

    if (options.instant) {
      rows.forEach((row) => { row.style.opacity = "1"; row.style.transform = "none"; });
    }
  };

  const openArtifact = (name) => {
    const data = artifactData[name];
    if (!data) return;
    const dialog = $("#artifact-dialog");
    $("#dialog-image").style.backgroundImage = `url("${data.image}")`;
    $("#artifact-dialog-kicker").textContent = data.kicker;
    $("#artifact-dialog-title").textContent = data.title;
    $("#artifact-dialog-copy").textContent = data.copy;
    $("#artifact-dialog-source").textContent = data.source;
    dialog.showModal();
    if (gsap && !reducedMotion) {
      gsap.fromTo(dialog, { autoAlpha: 0, scale: .92 }, { autoAlpha: 1, scale: 1, duration: .65, ease: "power3.out" });
      gsap.fromTo(".dialog-copy > *", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .08, delay: .22, ease: "power3.out" });
    }
  };

  const closeArtifact = () => {
    const dialog = $("#artifact-dialog");
    if (!dialog.open) return;
    if (gsap && !reducedMotion) gsap.to(dialog, { autoAlpha: 0, scale: .96, duration: .3, ease: "power2.in", onComplete: () => dialog.close() });
    else dialog.close();
  };

  const synthesize = async () => {
    if (visited.size < 3 || sessionState === "synthesizing" || sessionState === "complete") return;
    sessionState = "synthesizing";
    body.dataset.state = "synthesizing";
    body.classList.add("is-synthesizing");
    setSessionStatus("synthesis forming");
    $("#synthesize-button").hidden = true;
    $("#field-thought").textContent = "Research, engineering, and human context are not separate chapters. They are one repeated way of approaching difficult systems.";

    const allArtifacts = $$(".artifact");
    allArtifacts.forEach((artifact) => {
      artifact.classList.add("is-active");
      artifact.setAttribute("aria-hidden", "false");
      artifact.tabIndex = 0;
    });
    if (gsap && !reducedMotion) {
      gsap.to(finder, { autoAlpha: 0, scale: .72, x: 150, y: 150, duration: 1, ease: "power3.inOut" });
      gsap.to(allArtifacts, { autoAlpha: .38, y: 0, scale: .9, duration: 1.1, stagger: .06, ease: "power3.out" });
      gsap.to("#observer-lens", { autoAlpha: 0, duration: .25 });
    } else finder.style.opacity = "0";

    await wait(500);
    const finalMessage = $("#final-message");
    await reveal(finalMessage, { y: 14, duration: .7 });
    scrollConversation();
    await typeText($("#assistant-response"), responseText, 7);
    finalMessage.classList.add("is-complete");
    $("#synthesis-foot").hidden = false;
    $("#synthesis-foot").classList.add("is-visible");
    sessionState = "complete";
    body.dataset.state = "complete";
    setSessionStatus("synthesis complete · field remains open");
    announce("Synthesis complete. The evidence field remains open around the answer.");
    scrollConversation();
  };

  const setupLens = () => {
    const lens = $("#observer-lens");
    if (!gsap || window.matchMedia("(pointer: coarse)").matches) return;
    const moveX = gsap.quickTo(lens, "x", { duration: .36, ease: "power3.out" });
    const moveY = gsap.quickTo(lens, "y", { duration: .36, ease: "power3.out" });

    $("#evidence-field").addEventListener("pointermove", (event) => {
      moveX(event.clientX);
      moveY(event.clientY);
      if (!activeArtifact) return;
      const rect = activeArtifact.getBoundingClientRect();
      activeArtifact.style.setProperty("--artifact-x", `${event.clientX - rect.left}px`);
      activeArtifact.style.setProperty("--artifact-y", `${event.clientY - rect.top}px`);
    });

    $("#evidence-field").addEventListener("pointerenter", () => gsap.to(lens, { autoAlpha: .72, duration: .25 }));
    $("#evidence-field").addEventListener("pointerleave", () => {
      gsap.to(lens, { autoAlpha: 0, duration: .25 });
      if (activeArtifact) gsap.to(activeArtifact, { "--artifact-radius": "0px", duration: .3 });
      activeArtifact = null;
    });

    $$(".artifact").forEach((artifact) => {
      artifact.addEventListener("pointerenter", (event) => {
        activeArtifact = artifact;
        const rect = artifact.getBoundingClientRect();
        artifact.style.setProperty("--artifact-x", `${event.clientX - rect.left}px`);
        artifact.style.setProperty("--artifact-y", `${event.clientY - rect.top}px`);
        gsap.to(artifact, { "--artifact-radius": "150px", duration: .45, ease: "power2.out" });
        $("#observer-lens span").textContent = artifact.querySelector(".artifact-caption b")?.textContent || "observe";
      });
      artifact.addEventListener("pointerleave", () => {
        gsap.to(artifact, { "--artifact-radius": "0px", duration: .35, ease: "power2.in" });
        activeArtifact = null;
        $("#observer-lens span").textContent = "observe";
      });
      artifact.addEventListener("click", () => openArtifact(artifact.dataset.artifact));
    });
  };

  const renderToolDebug = (region = "research") => {
    $("#composer-wrap").hidden = true;
    $("#opening-space").hidden = true;
    $("#user-message-text").textContent = prompt;
    $("#reasoning-copy").textContent = reasoningText;
    for (const element of [$("#user-message"), $("#reasoning-message")]) {
      element.hidden = false;
      element.setAttribute("aria-hidden", "false");
      element.classList.add("is-visible");
      element.style.opacity = "1";
      element.style.transform = "none";
    }
    $("#tool-bench").hidden = false;
    documentTool.disabled = false;
    documentTool.classList.remove("is-ready");
    documentTool.setAttribute("aria-expanded", "true");
    $("#document-tool-state").textContent = "connected";
    toolSpace.style.setProperty("--origin-x", "30%");
    toolSpace.style.setProperty("--origin-y", "50%");
    toolSpace.style.clipPath = "circle(150vmax at 30% 50%)";
    toolSpace.style.visibility = "visible";
    toolSpace.inert = false;
    toolSpace.setAttribute("aria-hidden", "false");
    body.classList.add("tool-open");
    sessionState = "tool";
    setSessionStatus("inside document_reader");
    selectRegion(region, { instant: true });
    initDraggable();
  };

  $("#composer").addEventListener("submit", (event) => { event.preventDefault(); beginSession(); });
  documentTool.addEventListener("click", openToolSpace);
  $("#collapse-tool").addEventListener("click", collapseToolSpace);
  $("#synthesize-button").addEventListener("click", synthesize);
  $$(".region-button").forEach((button) => button.addEventListener("click", () => selectRegion(button.dataset.region)));
  $("#dialog-close").addEventListener("click", closeArtifact);
  $("#artifact-dialog").addEventListener("click", (event) => { if (event.target === event.currentTarget) closeArtifact(); });
  $("#restart-button").addEventListener("click", () => window.location.href = window.location.pathname);
  $("#new-chat").addEventListener("click", () => { if (sessionState !== "opening") window.location.href = window.location.pathname; });
  window.addEventListener("resize", () => { if (body.classList.contains("tool-open")) setToolOrigin(); });

  setupLens();

  if (params.get("state") === "tool") renderToolDebug(params.get("region") || "research");
  else if (params.get("state") === "final") {
    renderToolDebug("career");
    visited.add("research");
    visited.add("recent");
    $("#visited-count").textContent = "3 of 3 regions opened";
    if (gsap) gsap.set("#progress-fill", { width: "100%" });
    synthesize();
  }
})();
