/************************************************************
 * ASSISTLANA SKILLS
 * FREE LEARNING + FREE CERTIFICATION
 *
 * GOOGLE APPS SCRIPT BACKEND
 *
 * Features:
 * - Registration
 * - Skill-based MCQ API
 * - Secure public questions
 * - Server-side scoring
 * - Registration/skill validation
 * - Duplicate exam protection
 * - 75% passing score
 * - 3-warning disqualification
 * - Google Slides certificate generation
 * - PDF certificate
 * - Email certificate
 *
 * IMPORTANT:
 * Questions are maintained in Google Sheet:
 * MCQ_Questions
 ************************************************************/


// ==========================================================
// CONFIGURATION
// ==========================================================

const CONFIG = {

  SPREADSHEET_ID:
    "1O8gDwZ5v9B8iAUR_tlCZwjek8vMaT7aQlNZ4UU7AuDc",

  CERTIFICATE_TEMPLATE_ID:
    "1nfhadRilGHM7ZpopOiSSs-7rLhRblm2-HNR3OBB0ZBs",

  CERTIFICATE_FOLDER_NAME:
    "Skill Certification Certificates",

  TEST_EMAIL:
    "atchayaraj20@gmail.com",

  DEFAULTS: {

    PASSING_SCORE: 75,

    TOTAL_QUESTIONS: 30,

    EXAM_DURATION_MINUTES: 30,

    MAX_WARNINGS: 3,

    CERTIFICATE_EMAIL: "ENABLED",

    PROCTORING: "ENABLED"

  },

  SHEETS: {

    REGISTRATIONS:
      "Registrations",

    EXAM_RESULTS:
      "Exam_Results",

    CERTIFICATES:
      "Certificates",

    MCQ_QUESTIONS:
      "MCQ_Questions",

    SETTINGS:
      "Settings"

  }

};


// ==========================================================
// SHEET HEADERS
// ==========================================================

const HEADERS = {

  Registrations: [
    "Registration_ID",
    "Timestamp",
    "Full_Name",
    "Email",
    "Mobile",
    "Age",
    "City",
    "State",
    "Qualification",
    "College_Company",
    "Passout_Year",
    "Skill",
    "LinkedIn",
    "Consent",
    "Proctoring_Consent",
    "Status"
  ],

  Exam_Results: [
    "Exam_ID",
    "Registration_ID",
    "Email",
    "Skill",
    "Exam_Start",
    "Exam_End",
    "Total_Questions",
    "Correct",
    "Wrong",
    "Score_Percentage",
    "Warnings",
    "Tab_Switch_Count",
    "Fullscreen_Exit_Count",
    "Face_Absent_Count",
    "Multiple_Face_Count",
    "Audio_Warning_Count",
    "Result",
    "Disqualification_Reason"
  ],

  Certificates: [
    "Certificate_ID",
    "Registration_ID",
    "Name",
    "Email",
    "Skill",
    "Score",
    "Issue_Date",
    "Certificate_URL",
    "Email_Status",
    "Email_Sent_Date"
  ],

  MCQ_Questions: [
    "Question_ID",
    "Skill",
    "Question",
    "Option_A",
    "Option_B",
    "Option_C",
    "Option_D",
    "Correct_Answer",
    "Difficulty",
    "Explanation",
    "Active"
  ],

  Settings: [
    "Setting",
    "Value"
  ]

};


// ==========================================================
// GET API
// ==========================================================

function doGet(e) {

  try {

    ensureSheetsAndHeaders();

    const action =
      String(
        e &&
        e.parameter &&
        e.parameter.action
          ? e.parameter.action
          : "ping"
      );


    // ------------------------------------------------------
    // PING
    // ------------------------------------------------------

    if (action === "ping") {

      return jsonResponse({

        success: true,

        message:
          "ASSISTLANA Skills API is running."

      });

    }


    // ------------------------------------------------------
    // SETTINGS
    // ------------------------------------------------------

    if (action === "getSettings") {

      return jsonResponse({

        success: true,

        data:
          getSettings()

      });

    }


    // ------------------------------------------------------
    // QUESTIONS
    // ------------------------------------------------------

    if (action === "getQuestions") {

      const skill =
        String(
          e.parameter.skill || ""
        ).trim();


      if (!skill) {

        return jsonResponse({

          success: false,

          error:
            "Skill is required."

        });

      }


      return jsonResponse(
        getPublicQuestions(skill)
      );

    }


    return jsonResponse({

      success: false,

      error:
        "Unsupported action."

    });

  }

  catch (error) {

    console.error(error);

    return jsonResponse({

      success: false,

      error:
        "Request could not be completed."

    });

  }

}


// ==========================================================
// POST API
// ==========================================================

function doPost(e) {

  const lock =
    LockService.getScriptLock();


  try {

    lock.waitLock(30000);


    ensureSheetsAndHeaders();


    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {

      return jsonResponse({

        success: false,

        error:
          "Request body is empty."

      });

    }


    let body;


    try {

      body =
        JSON.parse(
          e.postData.contents
        );

    }

    catch (error) {

      return jsonResponse({

        success: false,

        error:
          "Invalid JSON request."

      });

    }


    const action =
      String(
        body.action || ""
      );


    // ------------------------------------------------------
    // REGISTRATION
    // ------------------------------------------------------

    if (
      action === "register"
    ) {

      return jsonResponse(
        registerCandidate(body)
      );

    }


    // ------------------------------------------------------
    // EXAM RESULT
    // ------------------------------------------------------

    if (
      action === "examResult"
    ) {

      return jsonResponse(
        submitExam(body)
      );

    }


    return jsonResponse({

      success: false,

      error:
        "Unsupported action."

    });

  }

  catch (error) {

    console.error(error);

    return jsonResponse({

      success: false,

      error:
        "Server error."

    });

  }

  finally {

    try {

      lock.releaseLock();

    }

    catch (ignore) {}

  }

}


// ==========================================================
// REGISTRATION
// ==========================================================

function registerCandidate(body) {


  const requiredFields = [

    "fullName",
    "email",
    "mobile",
    "age",
    "city",
    "state",
    "qualification",
    "collegeCompany",
    "passoutYear",
    "skill"

  ];


  for (
    let i = 0;
    i < requiredFields.length;
    i++
  ) {

    const field =
      requiredFields[i];


    if (
      !String(
        body[field] || ""
      ).trim()
    ) {

      return {

        success: false,

        error:
          field +
          " is required."

      };

    }

  }


  // --------------------------------------------------------
  // EMAIL
  // --------------------------------------------------------

  if (
    !isValidEmail(body.email)
  ) {

    return {

      success: false,

      error:
        "Valid email is required."

    };

  }


  // --------------------------------------------------------
  // CONSENT
  // --------------------------------------------------------

  if (
    body.consent !== true &&
    String(body.consent).toLowerCase() !==
      "true"
  ) {

    return {

      success: false,

      error:
        "General consent is required."

    };

  }


  if (
    body.proctoringConsent !== true &&
    String(body.proctoringConsent).toLowerCase() !==
      "true"
  ) {

    return {

      success: false,

      error:
        "Proctoring consent is required."

    };

  }


  // --------------------------------------------------------
  // DATABASE
  // --------------------------------------------------------

  const sheet =
    getSheet(
      CONFIG.SHEETS.REGISTRATIONS
    );


  const registrationId =
    generateId("REG");


  const email =
    String(body.email)
      .trim()
      .toLowerCase();


  sheet.appendRow([

    registrationId,

    new Date(),

    String(body.fullName).trim(),

    email,

    body.mobile || "",

    body.age || "",

    body.city || "",

    body.state || "",

    body.qualification || "",

    body.collegeCompany || "",

    body.passoutYear || "",

    String(body.skill).trim(),

    body.linkedin || "",

    "YES",

    "YES",

    "REGISTERED"

  ]);


  return {

    success: true,

    registrationId:

      registrationId,

    skill:

      String(body.skill).trim(),

    message:
      "Registration successful."

  };

}


// ==========================================================
// PUBLIC QUESTIONS
// ==========================================================

function getPublicQuestions(skill) {


  const rows =
    readRows(
      CONFIG.SHEETS.MCQ_QUESTIONS
    );


  const normalizedSkill =
    normalize(skill);


  const questions =
    rows

      .filter(
        function(row) {

          return (

            normalize(
              row.Skill
            ) ===
            normalizedSkill

            &&

            isActive(
              row.Active
            )

          );

        }
      )

      .map(
        function(row) {

          // IMPORTANT:
          // Correct_Answer is NEVER returned.
          // Explanation is NEVER returned.

          return {

            questionId:
              String(
                row.Question_ID
              ),

            skill:
              String(
                row.Skill
              ),

            question:
              String(
                row.Question
              ),

            options: {

              A:
                String(
                  row.Option_A
                ),

              B:
                String(
                  row.Option_B
                ),

              C:
                String(
                  row.Option_C
                ),

              D:
                String(
                  row.Option_D
                )

            },

            difficulty:
              String(
                row.Difficulty || ""
              )

          };

        }
      );


  return {

    success: true,

    data:
      questions

  };

}


// ==========================================================
// EXAM SUBMISSION
// ==========================================================

function submitExam(body) {


  // --------------------------------------------------------
  // REQUIRED
  // --------------------------------------------------------

  if (
    !body.examId ||
    !body.registrationId ||
    !body.email ||
    !body.skill ||
    !body.examStart
  ) {

    return {

      success: false,

      error:
        "Exam session details are missing."

    };

  }


  // --------------------------------------------------------
  // DUPLICATE EXAM CHECK
  // --------------------------------------------------------

  const existingExam =
    findRow(
      CONFIG.SHEETS.EXAM_RESULTS,
      "Exam_ID",
      body.examId
    );


  if (existingExam) {

    return {

      success: false,

      error:
        "This exam has already been submitted."

    };

  }


  // --------------------------------------------------------
  // FIND REGISTRATION
  // --------------------------------------------------------

  const registration =
    findRow(
      CONFIG.SHEETS.REGISTRATIONS,
      "Registration_ID",
      body.registrationId
    );


  if (!registration) {

    return {

      success: false,

      error:
        "Registration not found."

    };

  }


  // --------------------------------------------------------
  // VERIFY EMAIL
  // --------------------------------------------------------

  if (
    normalize(
      registration.Email
    ) !==
    normalize(
      body.email
    )
  ) {

    return {

      success: false,

      error:
        "Registration email does not match."

    };

  }


  // --------------------------------------------------------
  // VERIFY SKILL
  // --------------------------------------------------------

  if (
    normalize(
      registration.Skill
    ) !==
    normalize(
      body.skill
    )
  ) {

    return {

      success: false,

      error:
        "Registration skill does not match."

    };

  }


  // --------------------------------------------------------
  // ANSWERS
  // --------------------------------------------------------

  const answers =
    Array.isArray(body.answers)
      ? body.answers
      : [];


  // --------------------------------------------------------
  // ACTIVE QUESTIONS FOR THIS SKILL
  // --------------------------------------------------------

  const questionRows =
    readRows(
      CONFIG.SHEETS.MCQ_QUESTIONS
    )
      .filter(
        function(row) {

          return (

            normalize(
              row.Skill
            ) ===
            normalize(
              registration.Skill
            )

            &&

            isActive(
              row.Active
            )

          );

        }
      );


  // --------------------------------------------------------
  // QUESTION MAP
  // --------------------------------------------------------

  const questionMap = {};


  questionRows.forEach(
    function(row) {

      questionMap[
        String(
          row.Question_ID
        )
      ] = row;

    }
  );


  // --------------------------------------------------------
  // VALIDATE + SCORE
  // --------------------------------------------------------

  let correct = 0;

  const seen = {};


  for (
    let i = 0;
    i < answers.length;
    i++
  ) {

    const answer =
      answers[i];


    const questionId =
      String(
        answer.questionId || ""
      ).trim();


    const selectedAnswer =
      normalizeAnswer(
        answer.selectedAnswer
      );


    // Invalid question

    if (
      !questionId ||
      !questionMap[questionId]
    ) {

      return {

        success: false,

        error:
          "Answer set does not match the registered skill."

      };

    }


    // Duplicate question

    if (
      seen[questionId]
    ) {

      return {

        success: false,

        error:
          "Duplicate question submitted."

      };

    }


    seen[questionId] = true;


    // Invalid option

    if (
      !["A", "B", "C", "D"]
        .includes(
          selectedAnswer
        )
    ) {

      return {

        success: false,

        error:
          "Invalid answer submitted."

      };

    }


    // SERVER-SIDE ANSWER CHECK

    const correctAnswer =
      normalizeAnswer(
        questionMap[
          questionId
        ].Correct_Answer
      );


    if (
      selectedAnswer ===
      correctAnswer
    ) {

      correct++;

    }

  }


  // --------------------------------------------------------
  // TOTAL QUESTIONS
  // --------------------------------------------------------

  const settings =
    getSettings();


  const totalQuestions =
    Number(
      settings.Total_Questions ||
      settings.totalQuestions ||
      CONFIG.DEFAULTS.TOTAL_QUESTIONS
    );


  if (
    answers.length >
    totalQuestions
  ) {

    return {

      success: false,

      error:
        "Invalid question count."

    };

  }


  // --------------------------------------------------------
  // SCORE
  // --------------------------------------------------------

  const scorePercentage =
    Math.round(
      (
        correct /
        totalQuestions
      ) *
      10000
    ) / 100;


  const wrong =
    Math.max(
      totalQuestions -
      correct,
      0
    );


  // --------------------------------------------------------
  // PROCTORING COUNTS
  // --------------------------------------------------------

  const tabSwitchCount =
    safeCount(
      body.tabSwitchCount
    );


  const fullscreenExitCount =
    safeCount(
      body.fullscreenExitCount
    );


  const faceAbsentCount =
    safeCount(
      body.faceAbsentCount
    );


  const multipleFaceCount =
    safeCount(
      body.multipleFaceCount
    );


  const audioWarningCount =
    safeCount(
      body.audioWarningCount
    );


  // --------------------------------------------------------
  // SERVER CALCULATES WARNINGS
  // --------------------------------------------------------

  const warnings =
    tabSwitchCount +
    fullscreenExitCount +
    faceAbsentCount +
    multipleFaceCount +
    audioWarningCount;


  const maxWarnings =
    Number(
      settings.Max_Warnings ||
      settings.maxWarnings ||
      CONFIG.DEFAULTS.MAX_WARNINGS
    );


  const disqualified =
    warnings >= maxWarnings;


  const passingScore =
    Number(
      settings.Passing_Score ||
      settings.passingScore ||
      CONFIG.DEFAULTS.PASSING_SCORE
    );


  let result;


  if (
    disqualified
  ) {

    result =
      "DISQUALIFIED";

  }

  else if (
    scorePercentage >=
    passingScore
  ) {

    result =
      "PASS";

  }

  else {

    result =
      "FAIL";

  }


  // --------------------------------------------------------
  // SAVE RESULT
  // --------------------------------------------------------

  const resultSheet =
    getSheet(
      CONFIG.SHEETS.EXAM_RESULTS
    );


  resultSheet.appendRow([

    body.examId,

    body.registrationId,

    registration.Email,

    registration.Skill,

    body.examStart,

    new Date(),

    totalQuestions,

    correct,

    wrong,

    scorePercentage,

    warnings,

    tabSwitchCount,

    fullscreenExitCount,

    faceAbsentCount,

    multipleFaceCount,

    audioWarningCount,

    result,

    disqualified
      ? "Maximum warnings reached"
      : ""

  ]);


  // --------------------------------------------------------
  // RESPONSE
  // --------------------------------------------------------

  const response = {

    success: true,

    examId:
      body.examId,

    result:
      result,

    passed:
      result === "PASS",

    correct:
      correct,

    wrong:
      wrong,

    scorePercentage:
      scorePercentage,

    totalQuestions:
      totalQuestions,

    warnings:
      warnings,

    certificateGenerated:
      false

  };


  // --------------------------------------------------------
  // CERTIFICATE
  // --------------------------------------------------------

  if (
    result === "PASS"
  ) {

    const certificate =
      generateCertificate({

        registrationId:
          registration.Registration_ID,

        name:
          registration.Full_Name,

        email:
          registration.Email,

        skill:
          registration.Skill,

        score:
          scorePercentage

      });


    response.certificateGenerated =
      certificate.generated;


    response.certificate =
      certificate;

  }


  return response;

}


// ==========================================================
// CERTIFICATE GENERATION
// ==========================================================

function generateCertificate(params) {


  const certSheet =
    getSheet(
      CONFIG.SHEETS.CERTIFICATES
    );


  // --------------------------------------------------------
  // DUPLICATE CERTIFICATE CHECK
  // --------------------------------------------------------

  const existing =
    findCertificate(
      params.registrationId,
      params.skill
    );


  if (
    existing
  ) {

    return {

      generated: true,

      existing: true,

      certificateId:
        existing.Certificate_ID,

      certificateUrl:
        existing.Certificate_URL

    };

  }


  // --------------------------------------------------------
  // CERTIFICATE ID
  // --------------------------------------------------------

  const certificateId =
    generateId("CERT");


  const issueDate =
    new Date();


  const formattedDate =
    Utilities.formatDate(

      issueDate,

      Session.getScriptTimeZone(),

      "dd MMMM yyyy"

    );


  const formattedScore =
    Number(
      params.score
    ).toFixed(2) +
    "%";


  // --------------------------------------------------------
  // FOLDER
  // --------------------------------------------------------

  const folder =
    getOrCreateCertificateFolder();


  // --------------------------------------------------------
  // COPY TEMPLATE
  // --------------------------------------------------------

  const template =
    DriveApp.getFileById(
      CONFIG.CERTIFICATE_TEMPLATE_ID
    );


  const copied =
    template.makeCopy(

      "Certificate - " +
      sanitizeFileName(
        params.name
      ) +
      " - " +
      certificateId,

      folder

    );


  // --------------------------------------------------------
  // OPEN SLIDES
  // --------------------------------------------------------

  const presentation =
    SlidesApp.openById(
      copied.getId()
    );


  // --------------------------------------------------------
  // EXACT EXISTING PLACEHOLDERS
  // --------------------------------------------------------

  presentation
    .replaceAllText(
      "{{NAME}}",
      String(params.name)
    );


  presentation
    .replaceAllText(
      "{{SKILL}}",
      String(params.skill)
    );


  presentation
    .replaceAllText(
      "{{SCORE}}",
      formattedScore
    );


  presentation
    .replaceAllText(
      "{{CERTIFICATE_ID}}",
      certificateId
    );


  presentation
    .replaceAllText(
      "{{DATE}}",
      formattedDate
    );


  presentation.saveAndClose();


  Utilities.sleep(3000);


  // --------------------------------------------------------
  // PDF
  // --------------------------------------------------------

  const pdfBlob =
    DriveApp
      .getFileById(
        copied.getId()
      )
      .getAs(
        MimeType.PDF
      );


  pdfBlob.setName(

    "Certificate_" +
    certificateId +
    "_" +
    sanitizeFileName(
      params.name
    ) +
    ".pdf"

  );


  const pdfFile =
    folder.createFile(
      pdfBlob
    );


  // --------------------------------------------------------
  // LINK ACCESS
  // --------------------------------------------------------

  try {

    pdfFile.setSharing(

      DriveApp.Access.ANYONE_WITH_LINK,

      DriveApp.Permission.VIEW

    );

  }

  catch (sharingError) {

    console.error(
      sharingError
    );

  }


  const pdfUrl =
    pdfFile.getUrl();


  // --------------------------------------------------------
  // REMOVE TEMP SLIDES FILE
  // --------------------------------------------------------

  copied.setTrashed(
    true
  );


  // --------------------------------------------------------
  // EMAIL
  // --------------------------------------------------------

  let emailStatus =
    "DISABLED_IN_SETTINGS";


  let emailSentDate =
    "";


  const settings =
    getSettings();


  const emailEnabled =
    String(

      settings.Certificate_Email ||
      settings.certificateEmail ||
      CONFIG.DEFAULTS.CERTIFICATE_EMAIL

    )
      .toUpperCase() ===
    "ENABLED";


  if (
    emailEnabled
  ) {

    try {

      sendCertificateEmail(

        params.email,

        params.name,

        params.skill,

        formattedScore,

        certificateId,

        pdfBlob

      );


      emailStatus =
        "SENT";


      emailSentDate =
        new Date();

    }

    catch (emailError) {

      emailStatus =
        "FAILED";


      emailSentDate =
        new Date();


      console.error(
        emailError
      );

    }

  }


  // --------------------------------------------------------
  // SAVE CERTIFICATE
  // --------------------------------------------------------

  certSheet.appendRow([

    certificateId,

    params.registrationId,

    params.name,

    params.email,

    params.skill,

    formattedScore,

    issueDate,

    pdfUrl,

    emailStatus,

    emailSentDate

  ]);


  return {

    generated: true,

    existing: false,

    certificateId:
      certificateId,

    certificateUrl:
      pdfUrl,

    emailStatus:
      emailStatus,

    issueDate:
      formattedDate

  };

}


// ==========================================================
// SEND CERTIFICATE EMAIL
// ==========================================================

function sendCertificateEmail(

  recipientEmail,

  name,

  skill,

  score,

  certificateId,

  pdfBlob

) {


  const subject =
    "Congratulations! Your ASSISTLANA Skills Certificate";


  const htmlBody =

    "<div style='font-family:Arial,sans-serif;" +

    "max-width:600px;margin:auto;padding:30px;" +

    "border:1px solid #ddd;border-radius:12px;'>" +


    "<h2>🎓 Congratulations!</h2>" +


    "<p>Dear <strong>" +
    escapeHtml(name) +
    "</strong>,</p>" +


    "<p>You have successfully completed the " +
    "<strong>" +
    escapeHtml(skill) +
    "</strong> " +
    "skill assessment.</p>" +


    "<p><strong>Skill:</strong> " +
    escapeHtml(skill) +
    "</p>" +


    "<p><strong>Score:</strong> " +
    escapeHtml(score) +
    "</p>" +


    "<p><strong>Certificate ID:</strong> " +
    escapeHtml(certificateId) +
    "</p>" +


    "<p>Your digital certificate is attached to this email.</p>" +


    "<p>Best Regards,<br>" +
    "<strong>ASSISTLANA Skills Team</strong></p>" +


    "</div>";


  MailApp.sendEmail({

    to:
      recipientEmail,

    subject:
      subject,

    htmlBody:
      htmlBody,

    attachments: [
      pdfBlob
    ]

  });

}


// ==========================================================
// SETTINGS
// ==========================================================

function getSettings() {


  const sheet =
    getSheet(
      CONFIG.SHEETS.SETTINGS
    );


  const rows =
    sheet
      .getDataRange()
      .getValues();


  const settings = {

    Passing_Score:
      CONFIG.DEFAULTS.PASSING_SCORE,

    Total_Questions:
      CONFIG.DEFAULTS.TOTAL_QUESTIONS,

    Exam_Duration_Minutes:
      CONFIG.DEFAULTS.EXAM_DURATION_MINUTES,

    Max_Warnings:
      CONFIG.DEFAULTS.MAX_WARNINGS,

    Certificate_Email:
      CONFIG.DEFAULTS.CERTIFICATE_EMAIL,

    Proctoring:
      CONFIG.DEFAULTS.PROCTORING

  };


  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const key =
      String(
        rows[i][0] || ""
      ).trim();


    if (
      key
    ) {

      settings[key] =
        rows[i][1];

    }

  }


  return settings;

}


// ==========================================================
// SHEET SETUP
// ==========================================================

function setupSheets() {

  ensureSheetsAndHeaders();


  Logger.log(
    "ASSISTLANA Skills sheets and headers are ready."
  );

}


// ==========================================================
// ENSURE SHEETS
// ==========================================================

function ensureSheetsAndHeaders() {


  const ss =
    SpreadsheetApp.openById(
      CONFIG.SPREADSHEET_ID
    );


  Object.keys(
    HEADERS
  ).forEach(
    function(sheetName) {


      let sheet =
        ss.getSheetByName(
          sheetName
        );


      if (!sheet) {

        sheet =
          ss.insertSheet(
            sheetName
          );

      }


      const headers =
        HEADERS[sheetName];


      // Only write headers if sheet is empty.
      // This prevents accidental overwriting
      // of existing data.

      if (
        sheet.getLastRow() === 0
      ) {

        sheet
          .getRange(
            1,
            1,
            1,
            headers.length
          )
          .setValues(
            [headers]
          );

      }


      sheet.setFrozenRows(
        1
      );

    }
  );


  // --------------------------------------------------------
  // DEFAULT SETTINGS
  // --------------------------------------------------------

  const settingsSheet =
    ss.getSheetByName(
      CONFIG.SHEETS.SETTINGS
    );


  if (
    settingsSheet.getLastRow() <= 1
  ) {

    settingsSheet
      .getRange(
        2,
        1,
        6,
        2
      )
      .setValues([

        [
          "Passing_Score",
          75
        ],

        [
          "Total_Questions",
          30
        ],

        [
          "Exam_Duration_Minutes",
          30
        ],

        [
          "Max_Warnings",
          3
        ],

        [
          "Certificate_Email",
          "ENABLED"
        ],

        [
          "Proctoring",
          "ENABLED"
        ]

      ]);

  }


  SpreadsheetApp.flush();

}


// ==========================================================
// READ SHEET ROWS AS OBJECTS
// ==========================================================

function readRows(sheetName) {


  const sheet =
    getSheet(sheetName);


  if (
    sheet.getLastRow() < 2
  ) {

    return [];

  }


  const values =
    sheet
      .getDataRange()
      .getValues();


  const headers =
    values
      .shift()
      .map(
        function(header) {

          return String(
            header
          ).trim();

        }
      );


  return values.map(

    function(row) {

      const object = {};


      headers.forEach(

        function(header, index) {

          object[header] =
            row[index];

        }

      );


      return object;

    }

  );

}


// ==========================================================
// FIND ROW
// ==========================================================

function findRow(

  sheetName,

  key,

  value

) {


  const rows =
    readRows(
      sheetName
    );


  const target =
    normalize(value);


  return rows.find(

    function(row) {

      return (
        normalize(
          row[key]
        ) ===
        target
      );

    }

  ) || null;

}


// ==========================================================
// FIND CERTIFICATE
// ==========================================================

function findCertificate(

  registrationId,

  skill

) {


  const rows =
    readRows(
      CONFIG.SHEETS.CERTIFICATES
    );


  return rows.find(

    function(row) {

      return (

        normalize(
          row.Registration_ID
        ) ===
        normalize(
          registrationId
        )

        &&

        normalize(
          row.Skill
        ) ===
        normalize(
          skill
        )

      );

    }

  ) || null;

}


// ==========================================================
// GET SHEET
// ==========================================================

function getSheet(sheetName) {


  const ss =
    SpreadsheetApp.openById(
      CONFIG.SPREADSHEET_ID
    );


  const sheet =
    ss.getSheetByName(
      sheetName
    );


  if (!sheet) {

    throw new Error(
      "Missing sheet: " +
      sheetName
    );

  }


  return sheet;

}


// ==========================================================
// ACTIVE CHECK
// ==========================================================

function isActive(value) {


  const normalized =
    normalize(value);


  return (

    value === true

    ||

    normalized === "true"

    ||

    normalized === "yes"

    ||

    normalized === "1"

    ||

    normalized === "active"

  );

}


// ==========================================================
// ANSWER NORMALIZATION
// ==========================================================

function normalizeAnswer(value) {


  return String(
    value || ""
  )
    .trim()
    .toUpperCase()
    .replace(
      /^OPTION[_ -]?/,
      ""
    );

}


// ==========================================================
// NORMALIZE
// ==========================================================

function normalize(value) {


  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

}


// ==========================================================
// SAFE COUNT
// ==========================================================

function safeCount(value) {


  const count =
    Number(value);


  if (
    !Number.isFinite(count)
  ) {

    return 0;

  }


  return Math.max(
    0,
    Math.floor(count)
  );

}


// ==========================================================
// EMAIL VALIDATION
// ==========================================================

function isValidEmail(email) {


  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      String(email || "").trim()
    );

}


// ==========================================================
// UNIQUE ID
// ==========================================================

function generateId(prefix) {


  const date =
    Utilities.formatDate(

      new Date(),

      Session.getScriptTimeZone(),

      "yyyyMMdd"

    );


  const random =
    Utilities.getUuid()
      .replace(
        /-/g,
        ""
      )
      .substring(
        0,
        8
      )
      .toUpperCase();


  return (
    prefix +
    "-" +
    date +
    "-" +
    random
  );

}


// ==========================================================
// CERTIFICATE FOLDER
// ==========================================================

function getOrCreateCertificateFolder() {


  const folders =
    DriveApp.getFoldersByName(
      CONFIG.CERTIFICATE_FOLDER_NAME
    );


  if (
    folders.hasNext()
  ) {

    return folders.next();

  }


  return DriveApp.createFolder(
    CONFIG.CERTIFICATE_FOLDER_NAME
  );

}


// ==========================================================
// SANITIZE FILE NAME
// ==========================================================

function sanitizeFileName(name) {


  return String(name)

    .replace(
      /[^a-zA-Z0-9_\- ]/g,
      "_"
    )

    .trim()

    .substring(
      0,
      100
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(text) {


  return String(text)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ==========================================================
// JSON RESPONSE
// ==========================================================

function jsonResponse(data) {


  return ContentService

    .createTextOutput(
      JSON.stringify(data)
    )

    .setMimeType(
      ContentService.MimeType.JSON
    );

}


// ==========================================================
// TEST SETUP
// ==========================================================

function testSetup() {

  setupSheets();

  Logger.log(
    "SETUP TEST COMPLETED"
  );

}


// ==========================================================
// TEST QUESTIONS
// ==========================================================

function testQuestions() {


  const result =
    getPublicQuestions(
      "Python Fundamentals"
    );


  Logger.log(
    JSON.stringify(
      result
    )
  );

}


// ==========================================================
// TEST REGISTRATION
// ==========================================================

function testRegistration() {


  const testData = {

    fullName:
      "Test Candidate",

    email:
      CONFIG.TEST_EMAIL,

    mobile:
      "9876543210",

    age:
      "22",

    city:
      "Chennai",

    state:
      "Tamil Nadu",

    qualification:
      "B.Tech",

    collegeCompany:
      "Test College",

    passoutYear:
      "2026",

    skill:
      "Python Fundamentals",

    linkedin:
      "",

    consent:
      true,

    proctoringConsent:
      true

  };


  const result =
    registerCandidate(
      testData
    );


  Logger.log(
    JSON.stringify(
      result
    )
  );

}