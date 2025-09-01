n# Examplify: A Modern Online Examination Portal

Examplify is a comprehensive, full-stack online examination portal designed to streamline the process of creating, managing, and taking exams. Built with a focus on security, user experience, and administrative efficiency, it provides a robust platform for educational institutions and organizations to modernize their assessment workflows. The application features a clear separation of roles, with dedicated portals for both administrators and students, ensuring a secure and intuitive experience for all users.

### For Administrators: A Powerful Control Center

The administrator portal serves as the central hub for all examination-related activities. Upon logging in, admins are greeted with a dashboard that offers an at-a-glance overview of key metrics, including the total number of registered students, created exams, and completed submissions. A dynamic pie chart visualizes the current status of all exams—whether they are in "Draft," "Published," "Ongoing," or "Completed"—providing immediate insight into the examination lifecycle.

Admins have granular control over exam management. They can create new exams with specific details such as titles, descriptions, time limits, and scheduled dates. Each exam is supported by a dedicated question bank, allowing for the addition of both multiple-choice questions (MCQs), which are auto-graded, and descriptive (long-answer) questions. Student management is equally comprehensive, enabling admins to add, view, edit, and manage the status of student accounts.

To ensure academic integrity and provide timely feedback, Examplify includes a real-time monitoring dashboard for ongoing exams and a detailed grading section. Here, admins can review individual submissions, see student answers, and download consolidated results as a PDF for official records.

### For Students: A Seamless and Fair-Taking Experience

The student portal is designed to be simple, secure, and focused. After logging in, students are presented with a clean dashboard listing all their available exams. The exam-taking interface is built to minimize distractions and anxiety, featuring a persistent timer, a progress bar to track completed questions, and automatic question shuffling to ensure fairness. A unique real-time network speed indicator gives students peace of mind about their internet connection's stability during the test.

### Running the Project Locally

To run this project on your local machine using VS Code, follow these steps:

**1. Prerequisites**
*   Make sure you have [Node.js](https://nodejs.org/) (which includes npm) installed on your system. You can download it from the official website.
*   A code editor like [Visual Studio Code](https://code.visualstudio.com/).

**2. Installation**
*   Open your terminal or command prompt.
*   Navigate to the project's root directory (the folder where you downloaded the files).
*   Run the following command to install all the necessary dependencies:
    ```bash
    npm install
    ```

**3. Firebase Setup**
This project requires a Firebase project to handle the backend database and user authentication.
*   If you don't have one, create a new project at the [Firebase Console](https://console.firebase.google.com/).
*   In your Firebase project, create a new Web App.
*   From your Web App's settings, find the Firebase configuration object. It will look something like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "...",
      appId: "1:..."
    };
    ```
*   In the root directory of the project on your computer, create a new file named `.env.local`.
*   Copy and paste the following content into `.env.local`, replacing the placeholder values with the actual keys from your Firebase config object:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

**4. Running the Application**
*   Once the installation and setup are complete, run the following command in your terminal from the project's root directory:
    ```bash
    npm run dev
    ```
*   This will start the development server. Open your web browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application running.

You should now have a fully functional local version of Examplify running on your machine.

### Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: React, ShadCN UI, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Icons**: Lucide React
- **Charts**: Recharts
