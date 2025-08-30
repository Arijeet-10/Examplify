# Examplify: Online Examination Portal

This project is a comprehensive online examination portal called **Examplify**. It is designed with a clear separation of roles for administrators and students, providing a robust platform for creating, managing, and taking exams online.

### Key Features:

*   **Dual User Portals**: Secure and separate login interfaces for administrators and students.
*   **Administrator Dashboard**: A central hub for admins to get a quick overview of key metrics, including the total number of students, exams, and submissions. It also features a chart visualizing the status of all exams (e.g., Draft, Published, Ongoing).
*   **Exam Management**: Admins have full control over the exam lifecycle. They can create new exams with detailed information like titles, descriptions, time limits, and dates. They can also edit, view, and delete existing exams.
*   **Dynamic Question Bank**: Each exam has its own question bank, where administrators can add either multiple-choice questions (MCQs) or descriptive (long-answer) questions.
*   **Student Management**: Admins can manage the student roster, including adding new students, viewing their profiles, editing their information, and changing their account status between "Active" and "Inactive".
*   **Grading and Monitoring**: The platform supports auto-grading for multiple-choice questions. Admins can view detailed submission results, see individual student answers, and monitor exams in real-time as submissions come in. Results can also be downloaded as a PDF for record-keeping.
*   **Student Exam Experience**: Students can log in to their dashboard to see all available exams. The exam interface includes a timer, progress tracking, and question shuffling to ensure fairness. It also features a real-time network speed indicator to give students confidence in their connection.

### Tech Stack

*   **Framework**: Next.js
*   **Language**: TypeScript
*   **UI**: React, ShadCN UI, Tailwind CSS
*   **Backend**: Firebase (Firestore, Authentication, Storage)
*   **Icons**: Lucide React
*   **Charts**: Recharts
