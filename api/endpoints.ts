const BASE_URL_LIVE = "https://health-care-backend-eight.vercel.app/api";

const BASE_WEBSOCKET_URL_LIVE = "https://healthcarebackend-gcdo.onrender.com/api";

const BASE_SOCKET_URL = "https://healthcarebackend-gcdo.onrender.com/";

export const ENDPOINTS = {

    login: () => `${BASE_URL_LIVE}/auth/login`,
    sendOtp: () => `${BASE_URL_LIVE}/send-otp`,
    verifyOtp: () => `${BASE_URL_LIVE}/verify-otp`,
    getCaregiverTasks: (caregiverId: Number) => `${BASE_WEBSOCKET_URL_LIVE}/caregiver/${caregiverId}/tasks`,
    updateTasksStatus: () => `${BASE_WEBSOCKET_URL_LIVE}/tasks/update-status`,
    getPatientTasks: (patientId: string) => `${BASE_WEBSOCKET_URL_LIVE}/patient/${patientId}/tasks`,
    createPatientTask: () => `${BASE_WEBSOCKET_URL_LIVE}/patient/create-task`,
    websocketApiRealTimeUpdates: () => `${BASE_WEBSOCKET_URL_LIVE}`,
    baseWebsocketApiRealTimeUpdates: () => `${BASE_SOCKET_URL}`,
    getPatientReports: () => `${BASE_WEBSOCKET_URL_LIVE}/patient/daily-report`,
    uploadFile: () => `${BASE_URL_LIVE}/upload`,
    getPatientQrCode: (patientId: string) => `${BASE_URL_LIVE}/patient/${patientId}/qr-code`,
    verifyCaregiverQr: () => `${BASE_URL_LIVE}/verify-caregiver-qr`,
    getFamilyLeadContacts: (patientId: string) =>
        `${BASE_URL_LIVE}/patient/${patientId}/family-contacts`,
};
