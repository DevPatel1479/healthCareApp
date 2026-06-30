import { ENDPOINTS } from "@/api/endpoints";




export const uploadImageToServer = async (
    imageUri: string
) => {
    const formData = new FormData();

    formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `task_${Date.now()}.jpg`,
    } as any);

    const response = await fetch(
        ENDPOINTS.uploadFile(),
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Upload failed"
        );
    }

    return data.url;
};