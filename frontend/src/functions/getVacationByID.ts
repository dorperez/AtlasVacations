const getVacationByID = async (userToken:string, vacationID: number) => {
    const url = "http://localhost:3000/vacation/" + vacationID
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json",
            "x-auth-token":userToken
         }
    })
    const data = await res.json()
    return data
}

export default getVacationByID