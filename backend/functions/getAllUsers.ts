const getAllUsers = async () => {
    const url = "http://localhost:3000/users"
    const res = await fetch(url)
    const data = await res.json()
    return data
}

export default getAllUsers