const getAllVacations = async (userToken: string) => {

    if(!userToken || userToken == "") return
    const url = "http://localhost:3000/vacations"
    const res = await fetch(url, {
        method: "GET",
        headers: { "x-auth-token": userToken }
    })
    const data = await res.json()
    return data
}

export default getAllVacations