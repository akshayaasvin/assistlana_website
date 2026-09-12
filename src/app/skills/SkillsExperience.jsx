"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, ExternalLink, FileBadge, PlayCircle, ShieldCheck } from "lucide-react";
import { API_URL, skills } from "@/lib/skillsData";

const initialForm = { fullName: "", email: "", mobile: "", age: "", city: "", state: "", qualification: "", collegeCompany: "", passoutYear: "", linkedin: "", consent: false, proctoringConsent: false };
const initialSignals = { warnings: 0, tabSwitchCount: 0, fullscreenExitCount: 0, faceAbsentCount: 0, multipleFaceCount: 0, audioWarningCount: 0 };
const FACE_GRACE_FRAMES = 15;
const AUDIO_GRACE_FRAMES = 45;
const WARNING_COOLDOWN_MS = 10000;

function Field({ label, name, value, onChange, type = "text", required = true }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}{required && <span className="text-red-500"> *</span>}<input required={required} name={name} type={type} value={value} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>;
}

function Status({ children, type = "error" }) {
  return <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}><AlertCircle size={17} className="mt-0.5 shrink-0" />{children}</div>;
}

export default function SkillsExperience({ skill }) {
  const [activeLesson, setActiveLesson] = useState(0);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [stage, setStage] = useState("learning");
  const [form, setForm] = useState(initialForm);
  const [registrationId, setRegistrationId] = useState("");
  const [examId, setExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [examStart, setExamStart] = useState("");
  const [timeLeft, setTimeLeft] = useState(1800);
  const [signals, setSignals] = useState(initialSignals);
  const [result, setResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [monitoringStatus, setMonitoringStatus] = useState("Not active");
  const [mediaDiagnostics, setMediaDiagnostics] = useState({ camera: "unavailable", microphone: "unavailable", cameraPermission: "unknown", microphonePermission: "unknown" });
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const detectorRef = useRef(null);
  const faceFrameRef = useRef({ absent: 0, multiple: 0 });
  const audioFrameRef = useRef(0);
  const lastWarningRef = useRef({ faceAbsentCount: 0, multipleFaceCount: 0, audioWarningCount: 0 });
  const monitoringFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const examSubmittedRef = useRef(false);
  const startExamInFlightRef = useRef(false);
  const submitExamRef = useRef(null);

  const visibleLessons = showAllLessons ? skill.lessons : skill.lessons.slice(0, 6);
  const currentQuestion = questions[questionIndex];
  const relatedSkills = useMemo(() => skills.filter(item => item.slug !== skill.slug && item.category === skill.category).slice(0, 3), [skill]);

  const stopLocalMonitoring = () => {
    if (monitoringFrameRef.current) cancelAnimationFrame(monitoringFrameRef.current);
    monitoringFrameRef.current = null;
    const streams = [mediaStreamRef.current, cameraStreamRef.current, microphoneStreamRef.current].filter(Boolean);
    [...new Set(streams.flatMap(stream => stream.getTracks()))].forEach(track => track.stop());
    mediaStreamRef.current = null;
    cameraStreamRef.current = null;
    microphoneStreamRef.current = null;
    detectorRef.current?.close?.();
    detectorRef.current = null;
    audioContextRef.current?.close?.();
    audioContextRef.current = null;
    audioAnalyserRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const registerWarning = field => {
    setSignals(current => {
      const next = { ...current, [field]: current[field] + 1, warnings: current.warnings + 1 };
      if (next.warnings >= 3) setError("The assessment has reached the maximum warning limit and will be submitted for review.");
      return next;
    });
  };

  const issueSignalWarning = signal => {
    const now = Date.now();
    if (now - lastWarningRef.current[signal] < WARNING_COOLDOWN_MS) return;
    lastWarningRef.current[signal] = now;
    registerWarning(signal);
  };

  const monitorFrame = timestamp => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video) {
      monitoringFrameRef.current = requestAnimationFrame(monitorFrame);
      return;
    }

    if (detector && video.readyState >= 2) {
      const result = detector.detectForVideo(video, timestamp);
      const faceCount = result.detections?.length || 0;
      if (faceCount === 0) {
        faceFrameRef.current.absent += 1;
        faceFrameRef.current.multiple = 0;
        if (faceFrameRef.current.absent >= FACE_GRACE_FRAMES) {
          issueSignalWarning("faceAbsentCount");
          faceFrameRef.current.absent = 0;
        }
      } else if (faceCount > 1) {
        faceFrameRef.current.multiple += 1;
        faceFrameRef.current.absent = 0;
        if (faceFrameRef.current.multiple >= FACE_GRACE_FRAMES) {
          issueSignalWarning("multipleFaceCount");
          faceFrameRef.current.multiple = 0;
        }
      } else {
        faceFrameRef.current.absent = 0;
        faceFrameRef.current.multiple = 0;
      }
    }

    const analyser = audioAnalyserRef.current;
    if (analyser) {
      const samples = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(samples);
      const rms = Math.sqrt(samples.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / samples.length);
      if (rms > 0.12) audioFrameRef.current += 1;
      else audioFrameRef.current = 0;
      if (audioFrameRef.current >= AUDIO_GRACE_FRAMES) {
        issueSignalWarning("audioWarningCount");
        audioFrameRef.current = 0;
      }
    }
    monitoringFrameRef.current = requestAnimationFrame(monitorFrame);
  };

  const startLocalMonitoring = async stream => {
    mediaStreamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
    }
    let faceDetectionReady = false;
    try {
      const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm");
      detectorRef.current = await FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite" },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.6,
        minSuppressionThreshold: 0.3,
        numFaces: 2,
      });
      faceDetectionReady = true;
    } catch {
      setMonitoringStatus("Camera connected; face detection is unavailable in this browser session");
    }
    try {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) throw new Error("audio-unavailable");
      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioContext;
      audioAnalyserRef.current = analyser;
    } catch {
      setMonitoringStatus(faceDetectionReady ? "Face detection active locally; audio activity is unavailable" : "Camera connected; local monitoring is partly unavailable");
    }
    if (faceDetectionReady && audioAnalyserRef.current) setMonitoringStatus("Active locally: face presence and basic audio activity");
    if (faceDetectionReady || audioAnalyserRef.current) monitoringFrameRef.current = requestAnimationFrame(monitorFrame);
  };

  useEffect(() => {
    if (stage !== "exam") return undefined;
    const timer = window.setInterval(() => setTimeLeft(value => {
      if (value <= 1) { window.clearInterval(timer); submitExamRef.current?.(); return 0; }
      return value - 1;
    }), 1000);
    const onVisibility = () => { if (document.hidden) registerWarning("tabSwitchCount"); };
    const onFullscreen = () => { if (!document.fullscreenElement) registerWarning("fullscreenExitCount"); };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); document.removeEventListener("fullscreenchange", onFullscreen); };
  }, [stage]);

  useEffect(() => {
    if (stage === "exam" && signals.warnings >= 3 && !loading) submitExamRef.current?.();
  }, [signals.warnings, stage, loading]);

  useEffect(() => () => stopLocalMonitoring(), []);

  useEffect(() => {
    if (stage !== "instructions") return undefined;
    let cancelled = false;
    const updateMediaDiagnostics = async () => {
      const mediaDevices = navigator.mediaDevices;
      const next = {
        camera: mediaDevices?.getUserMedia ? "available" : "unavailable",
        microphone: mediaDevices?.getUserMedia ? "available" : "unavailable",
        cameraPermission: "unavailable",
        microphonePermission: "unavailable",
      };
      if (navigator.permissions?.query) {
        const [camera, microphone] = await Promise.allSettled([
          navigator.permissions.query({ name: "camera" }),
          navigator.permissions.query({ name: "microphone" }),
        ]);
        if (camera.status === "fulfilled") next.cameraPermission = camera.value.state;
        if (microphone.status === "fulfilled") next.microphonePermission = microphone.value.state;
      }
      if (!cancelled) setMediaDiagnostics(next);
    };
    updateMediaDiagnostics();
    return () => { cancelled = true; };
  }, [stage]);

  const updateForm = event => {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const beginRegistration = () => { setError(""); setStage("registration"); window.location.hash = "assessment"; };

  const submitRegistration = async event => {
    event.preventDefault();
    setError(""); setLoading(true);
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "register", ...form, skill: skill.name }) });
      const data = await response.json();
      if (!response.ok || !(data.registrationId || data.id)) throw new Error("registration");
      setRegistrationId(data.registrationId || data.id);
      setStage("instructions");
    } catch { setError("Registration could not be completed. Please try again."); }
    finally { setLoading(false); }
  };

  const startExam = async () => {
    if (startExamInFlightRef.current || stage !== "instructions") return;
    startExamInFlightRef.current = true;
    setError(""); setLoading(true);
    const requestedSkill = String(skill.name).trim();
    const logStartFailure = (phase, reason) => {
      if (process.env.NODE_ENV !== "production") console.warn(`ASSISTLANA ${phase} failed`, { skill: requestedSkill, message: reason.message, cause: reason });
    };

    let shuffled;
    try {
      const questionUrl = `${API_URL}?action=getQuestions&skill=${encodeURIComponent(requestedSkill)}`;
      const response = await fetch(questionUrl, { cache: "no-store", redirect: "follow" });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`The question service returned non-JSON data (HTTP ${response.status}).`);
      }
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `The question service returned HTTP ${response.status}.`);
      }
      const questionRows = Array.isArray(data.questions) ? data.questions : Array.isArray(data.data) ? data.data : [];
      const received = questionRows.filter(question => String(question.skill || "").trim() === requestedSkill).map(question => {
        const rawOptions = Array.isArray(question.options)
          ? question.options
          : question.options
            ? [question.options.A, question.options.B, question.options.C, question.options.D]
            : [question.optionA || question.Option_A, question.optionB || question.Option_B, question.optionC || question.Option_C, question.optionD || question.Option_D];
        return {
          questionId: question.questionId || question.question_id || question.Question_ID || question.id,
          skill: requestedSkill,
          question: question.question || question.Question,
          difficulty: question.difficulty || question.Difficulty,
          options: rawOptions.filter(option => typeof option === "string" && option.trim()),
        };
      });
      if (received.length < 30) throw new Error("not-enough");
      shuffled = [...received].sort(() => Math.random() - 0.5).slice(0, 30);
      setQuestions(shuffled);
      setAnswers({});
      setQuestionIndex(0);
    } catch (reason) {
      logStartFailure("question loading", reason);
      setError(reason.message === "not-enough" ? `Not enough questions are currently available for ${requestedSkill}.` : reason.message || "Questions could not be loaded for this skill.");
      startExamInFlightRef.current = false;
      setLoading(false);
      return;
    }

    let stream;
    const mediaErrorMessage = (device, reason) => {
      logStartFailure(`${device} permission`, reason);
      const isDevelopment = process.env.NODE_ENV !== "production";
      const deviceLabel = device === "camera" ? "Camera" : "Microphone";
      const messages = {
        NotAllowedError: `${deviceLabel} permission is required.`,
        NotFoundError: `No ${device} was found on this device.`,
        NotReadableError: `The ${device} is currently being used by another application.`,
        SecurityError: `${deviceLabel} access is blocked by the browser.`,
      };
      return messages[reason.name] || (reason.message === "media-unavailable" ? `${deviceLabel} permission is required.` : isDevelopment ? `${deviceLabel} access failed (${reason.name || "UnknownError"}): ${reason.message || "Unknown error"}` : `${deviceLabel} access could not be started. Please check your device and browser settings.`);
    };

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("media-unavailable");
      stopLocalMonitoring();
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraStreamRef.current.getVideoTracks().length === 0) throw new DOMException("No video track returned", "NotFoundError");
      mediaStreamRef.current = cameraStreamRef.current;
      setMediaDiagnostics(current => ({ ...current, camera: "available", cameraPermission: "granted" }));
    } catch (reason) {
      setError(mediaErrorMessage("camera", reason));
      stopLocalMonitoring();
      startExamInFlightRef.current = false;
      setLoading(false);
      return;
    }

    try {
      microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (microphoneStreamRef.current.getAudioTracks().length === 0) throw new DOMException("No audio track returned", "NotFoundError");
      setMediaDiagnostics(current => ({ ...current, microphone: "available", microphonePermission: "granted" }));
    } catch (reason) {
      setError(mediaErrorMessage("microphone", reason));
      startExamInFlightRef.current = false;
      setLoading(false);
      return;
    }

    stream = new MediaStream([
      ...cameraStreamRef.current.getVideoTracks(),
      ...microphoneStreamRef.current.getAudioTracks(),
    ]);
    mediaStreamRef.current = stream;
    const startedAt = new Date().toISOString();
    const nextExamId = globalThis.crypto?.randomUUID?.() || `ASSISTLANA-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    let fullscreenNotice = "";
    try {
      const fullscreenTarget = document.documentElement;
      const requestFullscreen = fullscreenTarget.requestFullscreen || fullscreenTarget.webkitRequestFullscreen;
      if (!requestFullscreen) throw new Error("fullscreen-unavailable");
      await requestFullscreen.call(fullscreenTarget);
    } catch (reason) {
      logStartFailure("fullscreen request", reason);
      fullscreenNotice = "Fullscreen mode is unavailable on this browser. The exam will continue in the current window.";
    }

    setExamStart(startedAt);
    setExamId(nextExamId);
    setTimeLeft(1800);
    setSignals(initialSignals);
    setMonitoringStatus(fullscreenNotice || "Starting local monitoring...");
    if (fullscreenNotice) setError(fullscreenNotice);
    setStage("exam");
    examSubmittedRef.current = false;
    try {
      await startLocalMonitoring(stream);
    } finally {
      startExamInFlightRef.current = false;
      setLoading(false);
    }
  };

  async function submitExam() {
    if (!questions.length || loading || stage !== "exam" || examSubmittedRef.current) return;
    examSubmittedRef.current = true;
    setLoading(true); setError("");
    const payload = { action: "examResult", registrationId, examId, fullName: form.fullName, email: form.email, skill: skill.name, examStart, examEnd: new Date().toISOString(), totalQuestions: questions.length, answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer })), ...signals, disqualified: signals.warnings >= 3, disqualificationReason: signals.warnings >= 3 ? "Maximum warnings reached" : "" };
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error("result");
      setResult(data); setCertificate((data.status === "PASS" || data.passed === true) ? data.certificate || null : null); setStage("result"); stopLocalMonitoring();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch { examSubmittedRef.current = false; setError("Unable to connect to the certification server. Please try again."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    submitExamRef.current = submitExam;
  });

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return <main>
    <section className="bg-[#10213b] text-white"><div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20"><div className="max-w-4xl"><Link href="/skills" className="mb-7 inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white"><ArrowLeft size={16} /> All skills</Link><div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-cyan-200"><span>{skill.category}</span><span className="text-white/30">/</span><span>{skill.level} pathway</span></div><h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{skill.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{skill.description}</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => document.getElementById("lessons")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#10213b] hover:bg-cyan-300"><PlayCircle size={17} /> Start learning</button><button onClick={beginRegistration} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10"><FileBadge size={17} /> Get certified</button></div></div></div></section>

    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1fr_340px] md:px-8"><div><div className="border-l-4 border-cyan-400 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Quick answer</p><h2 className="mt-3 text-2xl font-black">What is {skill.name}?</h2><p className="mt-3 text-lg leading-8 text-slate-700">{skill.definition}</p></div><div className="mt-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Questions you can answer</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{skill.quickAnswers.map(([question, answer]) => <a key={question} href={`#answer-${question.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700">{question}<span className="mt-2 block text-xs font-normal text-slate-500">{answer}</span></a>)}</div></div></div><aside className="h-fit border border-slate-200 bg-white p-6 md:sticky md:top-24"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Course snapshot</p><dl className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Level</dt><dd className="font-bold">{skill.level}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Lessons</dt><dd className="font-bold">{skill.lessons.length}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Assessment</dt><dd className="font-bold">30 questions</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Pass mark</dt><dd className="font-bold">75%</dd></div></dl><button onClick={beginRegistration} className="mt-7 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">Begin certification</button></aside></section>

    <section id="lessons" className="scroll-mt-20 border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-14 md:px-8"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Learning path</p><h2 className="mt-3 text-3xl font-black">Learn one useful idea at a time.</h2><p className="mt-3 leading-7 text-slate-600">Every lesson starts with a direct answer, then adds the reasoning, example, practice task, and a question you can use to check your understanding.</p></div><div className="mt-10 grid gap-8 md:grid-cols-[270px_1fr]"><nav className="space-y-2">{visibleLessons.map((lesson, index) => <button key={lesson.title} onClick={() => setActiveLesson(index)} className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activeLesson === index ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>{String(index + 1).padStart(2, "0")} <span className="ml-2">{lesson.title}</span></button>)}{skill.lessons.length > 6 && <button onClick={() => setShowAllLessons(value => !value)} className="px-4 py-3 text-sm font-bold text-blue-700">{showAllLessons ? "Show fewer lessons" : `Show all ${skill.lessons.length} lessons`}</button>}</nav><article className="border border-slate-200 bg-[#fbfcff] p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Lesson {activeLesson + 1}</p><h3 className="mt-3 text-2xl font-black">{skill.lessons[activeLesson].title}</h3><p className="mt-4 text-lg leading-8 text-slate-700">{skill.lessons[activeLesson].answer}</p><div className="mt-8 grid gap-6 sm:grid-cols-2">{[["Why is it important?", skill.lessons[activeLesson].why], ["How does it work?", skill.lessons[activeLesson].how], ["Example", skill.lessons[activeLesson].example], ["Practice task", skill.lessons[activeLesson].practice]].map(([title, text]) => <div key={title}><h4 className="font-extrabold">{title}</h4><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{text}</p></div>)}</div><div className="mt-8 border-t border-slate-200 pt-6"><h4 className="font-extrabold">Common mistakes</h4><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{skill.lessons[activeLesson].mistakes.map(item => <li key={item}>{item}</li>)}</ul><h4 className="mt-6 font-extrabold">Interview question</h4><p className="mt-2 text-sm leading-6 text-slate-600">{skill.lessons[activeLesson].interview}</p></div></article></div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-14 md:px-8"><div className="grid gap-10 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Quick answers</p><h2 className="mt-3 text-3xl font-black">Search-friendly answers, written for people.</h2><div className="mt-7 space-y-5">{skill.quickAnswers.map(([question, answer]) => <div id={`answer-${question.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} key={question} className="border-b border-slate-200 pb-5"><h3 className="font-extrabold">{question}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p></div>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Frequently asked questions</p><div className="mt-7 space-y-3">{skill.faqs.map(([question, answer]) => <details key={question} className="group border border-slate-200 bg-white p-4"><summary className="cursor-pointer list-none pr-5 font-bold">{question}<span className="float-right text-blue-600">+</span></summary><p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></div></div></section>

    <section id="assessment" className="scroll-mt-20 bg-[#eaf5ff]"><div className="mx-auto max-w-7xl px-5 py-14 md:px-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Assessment and certificate</p><h2 className="mt-3 text-3xl font-black">Ready to prove your {skill.name.replace(" Fundamentals", "")} skills?</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">Register for the selected skill, review the browser-based monitoring notice, and take the live assessment when enough questions are available.</p></div><button onClick={beginRegistration} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">Start registration <ArrowRight size={16} /></button></div></div></section>

    {relatedSkills.length > 0 && <section className="mx-auto max-w-7xl px-5 py-14 md:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Related skills</p><div className="mt-5 grid gap-4 md:grid-cols-3">{relatedSkills.map(item => <Link href={`/skills/${item.slug}`} key={item.slug} className="border border-slate-200 bg-white p-5 font-bold hover:border-blue-300 hover:text-blue-700">{item.name}<span className="mt-2 block text-sm font-normal text-slate-500">{item.description}</span></Link>)}</div></section>}

    {stage !== "learning" && <section className="fixed inset-0 z-[60] overflow-y-auto bg-[#10213b]/80 px-4 py-8 backdrop-blur-sm"><div className="mx-auto max-w-3xl border border-slate-200 bg-[#f6f8fc] p-5 shadow-2xl md:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">{skill.name}</p><h2 className="mt-2 text-2xl font-black">{stage === "registration" ? "Registration" : stage === "instructions" ? "Assessment instructions" : stage === "exam" ? "Skill assessment" : "Assessment result"}</h2></div>{stage !== "exam" && <button onClick={() => { setStage("learning"); setError(""); }} className="text-sm font-bold text-slate-500 hover:text-slate-900">Close</button>}</div>{error && <div className="mt-6"><Status>{error}</Status></div>}

      {stage === "registration" && <form onSubmit={submitRegistration} className="mt-7 space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="Full name" name="fullName" value={form.fullName} onChange={updateForm} /><Field label="Email" name="email" type="email" value={form.email} onChange={updateForm} /><Field label="Mobile number" name="mobile" type="tel" value={form.mobile} onChange={updateForm} /><Field label="Age" name="age" type="number" value={form.age} onChange={updateForm} /><Field label="City" name="city" value={form.city} onChange={updateForm} /><Field label="State" name="state" value={form.state} onChange={updateForm} /><Field label="Qualification" name="qualification" value={form.qualification} onChange={updateForm} /><Field label="College / company" name="collegeCompany" value={form.collegeCompany} onChange={updateForm} /><Field label="Passout year" name="passoutYear" type="number" value={form.passoutYear} onChange={updateForm} /><Field label="LinkedIn profile" name="linkedin" value={form.linkedin} onChange={updateForm} required={false} /></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><strong>Selected skill:</strong> {skill.name}. This selection stays fixed through registration, assessment, result, and certificate.</div><label className="flex gap-3 text-sm text-slate-600"><input required name="consent" type="checkbox" checked={form.consent} onChange={updateForm} className="mt-1" />I agree to the general terms and conditions.</label><label className="flex gap-3 text-sm text-slate-600"><input required name="proctoringConsent" type="checkbox" checked={form.proctoringConsent} onChange={updateForm} className="mt-1" />I understand and consent to camera/microphone permission requests and browser-based proctoring signals for this assessment.</label><button disabled={loading} className="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">{loading ? "Registering..." : "Continue to assessment"}</button></form>}

      {stage === "instructions" && <div className="mt-7"><div className="grid gap-4 sm:grid-cols-3">{[[Clock3, "30 minutes"], [FileBadge, "30 questions"], [ShieldCheck, "75% to pass"]].map(([Icon, text]) => <div key={text} className="border border-slate-200 bg-white p-4 text-center"><Icon className="mx-auto text-blue-700" size={22} /><p className="mt-3 text-sm font-bold">{text}</p></div>)}</div><div className="mt-6 border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900"><strong>Browser-based monitoring:</strong> the assessment may use camera and microphone permission, fullscreen status, tab visibility, face presence, multiple-face signals, and basic audio activity. These signals are not perfectly accurate. No camera or microphone recordings are stored by this exam interface.</div><p className="mt-5 text-sm leading-7 text-slate-600">You will receive warnings for relevant events. Three warnings can disqualify the attempt. Keep this assessment window visible and answer independently.</p><div className="mt-5 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 sm:grid-cols-2"><span>Camera: <strong>{mediaDiagnostics.camera}</strong></span><span>Microphone: <strong>{mediaDiagnostics.microphone}</strong></span><span>Camera permission: <strong>{mediaDiagnostics.cameraPermission}</strong></span><span>Microphone permission: <strong>{mediaDiagnostics.microphonePermission}</strong></span></div><button onClick={startExam} disabled={loading} className="mt-7 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">{loading ? "Loading questions..." : "Request permissions and start"}</button></div>}

      {stage === "exam" && currentQuestion && <div className="mt-7"><div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold"><span>Question {questionIndex + 1} of {questions.length}</span><span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700"><Clock3 size={15} /> {minutes}:{seconds}</span></div><div className="mt-4 h-2 bg-slate-200"><div className="h-full bg-blue-600 transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div><div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600"><span>{monitoringStatus}</span><span className="font-bold text-amber-700">Warning {Math.min(signals.warnings, 3)} of 3</span></div><video ref={videoRef} autoPlay muted playsInline className="pointer-events-none absolute h-px w-px opacity-0" aria-hidden="true" /><div className="mt-8 border border-slate-200 bg-white p-6"><p className="text-lg font-extrabold leading-8">{currentQuestion.question}</p><div className="mt-6 space-y-3">{currentQuestion.options.map((option, index) => { const optionKey = String.fromCharCode(65 + index); const questionKey = currentQuestion.questionId || currentQuestion.id; return <label key={`${questionKey}-${optionKey}`} className={`flex cursor-pointer gap-3 border p-4 text-sm ${answers[questionKey] === optionKey ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}><input type="radio" name={`question-${questionKey}`} checked={answers[questionKey] === optionKey} onChange={() => setAnswers(current => ({ ...current, [questionKey]: optionKey }))} />{option}</label>; })}</div></div><div className="mt-6 flex justify-between gap-3"><button disabled={questionIndex === 0} onClick={() => setQuestionIndex(value => value - 1)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold disabled:opacity-40">Previous</button>{questionIndex === questions.length - 1 ? <button onClick={submitExam} disabled={loading} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? "Submitting..." : "Submit assessment"}</button> : <button onClick={() => setQuestionIndex(value => value + 1)} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white">Next</button>}</div><p className="mt-5 text-xs text-slate-500">Tab switches: {signals.tabSwitchCount}. Fullscreen exits: {signals.fullscreenExitCount}. Face absence: {signals.faceAbsentCount}. Multiple faces: {signals.multipleFaceCount}. Audio warnings: {signals.audioWarningCount}.</p></div>}

      {stage === "result" && <div className="mt-7">{result?.disqualified || result?.status === "DISQUALIFIED" ? <Status>Your assessment has been disqualified according to the assessment rules.</Status> : result?.passed || result?.status === "PASS" ? <div className="rounded-xl bg-emerald-50 p-6 text-emerald-900"><CheckCircle2 size={28} /><h3 className="mt-4 text-2xl font-black">Congratulations, you passed.</h3><p className="mt-2">{skill.name} · Score: <strong>{result.scorePercentage ?? result.score ?? "Recorded"}%</strong></p>{certificate && <div className="mt-5 border border-emerald-200 bg-white p-4 text-sm"><strong>Certificate generated successfully</strong><p className="mt-2">Certificate ID: {certificate.certificateId || certificate.id || "Provided by backend"}</p>{certificate.certificateUrl && <a className="mt-3 inline-flex items-center gap-2 font-bold text-blue-700" href={certificate.certificateUrl} target="_blank" rel="noreferrer">View certificate <ExternalLink size={14} /></a>}<p className="mt-3 text-slate-600">Your certificate has been sent to your registered email address.</p></div>}</div> : <div className="rounded-xl bg-amber-50 p-6 text-amber-900"><h3 className="text-2xl font-black">Thank you for completing the assessment.</h3><p className="mt-3">Your score: <strong>{result?.scorePercentage ?? result?.score ?? "Recorded"}%</strong></p><p className="mt-2">Passing score: 75%. Result: Not passed.</p></div>}</div>}
    </div></section>}
  </main>;
}
