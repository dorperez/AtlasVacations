const checkTokenExpiration = async (token: string) => {
    //console.log("Checking token...");
    try {
        const url = "http://localhost:3000/verifyToken"
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const data = await response.json()
        return data?.data === 'jwt expired';
    } catch (error: any) {
        console.error('Error verifying token:', error.message);
        return true;
    }
};

export default checkTokenExpiration