const getAllFollowers = async (userToken: string) => {
    const url = "http://localhost:3000/followers"
    const res = await fetch(url, {
        method: "GET",
        headers: { "x-auth-token": userToken }
    })
    const data = await res.json()
    return data
}

export default getAllFollowers