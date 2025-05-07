const getUserByEmail = async (userEmail: string) => {
    const url = `http://localhost:3000/user/${userEmail}`
    const res = await fetch(url)
    const data = await res.json()
    return data
}

export default getUserByEmail