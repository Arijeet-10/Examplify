# Examplify: A Modern Online Examination Portal

Examplify is a comprehensive, full-stack online examination portal designed to streamline the process of creating, managing, and taking exams. Built with a focus on security, user experience, and administrative efficiency, it provides a robust platform for educational institutions and organizations to modernize their assessment workflows. The application features a clear separation of roles, with dedicated portals for both administrators and students, ensuring a secure and intuitive experience for all users.

### For Administrators: A Powerful Control Center

The administrator portal serves as the central hub for all examination-related activities. Upon logging in, admins are greeted with a dashboard that offers an at-a-glance overview of key metrics, including the total number of registered students, created exams, and completed submissions. A dynamic pie chart visualizes the current status of all exams—whether they are in "Draft," "Published," "Ongoing," or "Completed"—providing immediate insight into the examination lifecycle.

Admins have granular control over exam management. They can create new exams with specific details such as titles, descriptions, time limits, and scheduled dates. Each exam is supported by a dedicated question bank, allowing for the addition of both multiple-choice questions (MCQs), which are auto-graded, and descriptive (long-answer) questions. Student management is equally comprehensive, enabling admins to add, view, edit, and manage the status of student accounts.

To ensure academic integrity and provide timely feedback, Examplify includes a real-time monitoring dashboard for ongoing exams and a detailed grading section. Here, admins can review individual submissions, see student answers, and download consolidated results as a PDF for official records.

### For Students: A Seamless and Fair-Taking Experience

The student portal is designed to be simple, secure, and focused. After logging in, students are presented with a clean dashboard listing all their available exams. The exam-taking interface is built to minimize distractions and anxiety, featuring a persistent timer, a progress bar to track completed questions, and automatic question shuffling to ensure fairness. A unique real-time network speed indicator gives students peace of mind about their internet connection's stability during the test.

### Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: React, ShadCN UI, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Icons**: Lucide React
- **Charts**: Recharts