const registerUser = async (name: string, lastName: string, email: string, password: string) => {
    const url = "http://localhost:3000/register"
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastName, email, password })
        
    })
    const data = await res.json()
    return data
}

export default registerUser