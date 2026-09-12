# ASSISTLANA Skills Apps Script deployment

The repository does not contain the current deployed Apps Script source. `Code.gs` is a replacement implementation that uses the existing spreadsheet tabs:

- `Registrations`
- `Exam_Results`
- `Certificates`
- `MCQ_Questions`
- `Settings`

## Sheet headers

The first row of every sheet must contain the field names used by the script. `MCQ_Questions` must include `Question_ID`, `Skill`, `Question`, `Option_A`, `Option_B`, `Option_C`, `Option_D`, `Correct_Answer`, `Difficulty`, `Explanation`, and `Active`. The public question response deliberately maps only the safe fields and never returns `Correct_Answer` or `Explanation`.

## Deploy

1. Open the Apps Script project that owns the current `/exec` URL.
2. Replace the existing server code with `Code.gs`, or merge its `doGet`, `doPost`, and helper functions into the existing project.
3. Confirm the project is bound to the spreadsheet containing the five existing tabs.
4. If certificates should be generated, add script properties named `CERTIFICATE_TEMPLATE_ID` and `CERTIFICATE_FOLDER_ID`. The Slides template should contain `{{CANDIDATE_NAME}}`, `{{SKILL}}`, `{{SCORE}}`, `{{CERTIFICATE_ID}}`, and `{{ISSUE_DATE}}` placeholders.
5. Save the project.
6. Use **Deploy > Manage deployments**, edit the existing web-app deployment, select **New version**, and deploy. This preserves the same `/exec` URL when editing the existing deployment.
7. Set execution to the owner and access to the audience required by the existing frontend.

## Smoke tests

Use the existing `/exec` URL:

- `?action=ping`
- `?action=getSettings`
- `?action=getQuestions&skill=Python%20Fundamentals`

Inspect the question response and confirm it contains only `questionId`, `skill`, `question`, `options`, and `difficulty`. Then register a candidate and submit an `examResult` with answer pairs. Verify that the result row contains the server-calculated `Correct`, `Wrong`, `Score_Percentage`, and `Status` values.

Security tests:

- Send a fake `scorePercentage: 100`; the backend ignores it.
- Use a Python registration with a JavaScript question ID; the backend rejects it.
- Submit the same `examId` twice; the second request is rejected.
- Verify 74.99% is `FAIL`, 75% is `PASS`, and three server-counted warnings are `DISQUALIFIED`.
- Verify certificates are generated only for `PASS` and only when the certificate template and folder properties are configured.
