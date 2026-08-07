// const BASE_URL_LIVE = "https://health-care-backend-eight.vercel.app/api";

// const BASE_WEBSOCKET_URL_LIVE = "https://healthcarebackend-gcdo.onrender.com/api";

// const BASE_SOCKET_URL = "https://healthcarebackend-gcdo.onrender.com/";


const DOMAIN = "https://kutumbijan.com";

const BASE_URL_LIVE = `${DOMAIN}/api`;

const BASE_WEBSOCKET_URL_LIVE = `${DOMAIN}/api`;

const BASE_SOCKET_URL = DOMAIN;





export const ENDPOINTS = {

    login: () => `/auth/login`,
    sendOtp: () => `/send-otp`,
    verifyOtp: () => `/verify-otp`,
    getCaregiverTasks: (caregiverId: number) => `/caregiver/${caregiverId}/tasks`,
    updateTasksStatus: () => `/tasks/update-status`,
    getPatientTasks: (patientId: string) => `/patient/${patientId}/tasks`,
    createPatientTask: () => `/patient/create-task`,
    websocketApiRealTimeUpdates: () => `/`,
    getPatientReports: () => `/patient/daily-report`,
    uploadFile: () => `/upload`,
    getPatientQrCode: (patientId: string) => `/patient/${patientId}/qr-code`,
    verifyCaregiverQr: () => `/caregiver/verify-qr`,
    getFamilyLeadContacts: (patientId: string) =>
        `/patient/${patientId}/family-contacts`,

    refreshCaregiver: () => '/patient/refresh-caregiver',

    baseWebsocketApiRealTimeUpdates: () => `${BASE_SOCKET_URL}`,

};
