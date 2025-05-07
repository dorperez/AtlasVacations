const loginUser = async (email: string, password: string) => {
    const url = "http://localhost:3000/login"
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    return data
}

export default loginUser