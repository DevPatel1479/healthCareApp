import { ENDPOINTS } from "@/api/endpoints";
import { apiClient } from "@/api/apiClient";



// export const uploadImageToServer = async (
//     imageUri: string
// ) => {
//     const formData = new FormData();

//     formData.append("file", {
//         uri: imageUri,
//         type: "image/jpeg",
//         name: `task_${Date.now()}.jpg`,
//     } as any);

//     const response = await fetch(
//         ENDPOINTS.uploadFile(),
//         {
//             method: "POST",
//             body: formData,
//         }
//     );

//     console.log(`response : ${JSON.stringify(response)}`);
//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(
//             data.message || "Upload failed"
//         );
//     }

//     return data.url;
// };



export const uploadImageToServer = async (
    imageUri: string
) => {
    const formData = new FormData();

    formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `task_${Date.now()}.jpg`,
    } as any);

    const response = await apiClient.post(
        ENDPOINTS.uploadFile(),
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    console.log("Upload response:", response.data);

    const data = response.data;

    if (!data.success) {
        throw new Error(
            data.message || "Upload failed"
        );
    }

    return data.url;
};