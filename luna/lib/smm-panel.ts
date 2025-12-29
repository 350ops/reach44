export const smmClient = {
    addOrder: async (serviceId: number, link: string, quantity: number) => {
        const apiKey = process.env.SMM_PANEL_API_KEY;
        if (!apiKey) {
            throw new Error("SMM_PANEL_API_KEY is not configured");
        }

        try {
            const payload = {
                key: apiKey,
                action: "add",
                service: serviceId,
                link,
                quantity,
            };

            console.log(
                `[SMM Client] Sending Request to ${"https://justanotherpanel.com/api/v2"}`,
                { ...payload, key: "***MASKED***" }
            );

            const response = await fetch("https://justanotherpanel.com/api/v2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(
                    `[SMM Client] HTTP Error: ${response.status} ${response.statusText}`
                );
                throw new Error(`SMM API Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("[SMM Client] Response:", data);

            if (data.error) {
                console.error(`[SMM Client] API Logic Error: ${data.error}`);
                throw new Error(`SMM API Error: ${data.error}`);
            }

            return data;
        } catch (error) {
            console.error("Failed to add order to SMM panel:", error);
            throw error;
        }
    },
};
