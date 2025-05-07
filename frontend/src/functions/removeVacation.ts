const removeVacation = async (userToken: string, vacationID: number) => {
    const url = "http://localhost:3000/removeVacation/" + vacationID
    const res = await fetch(url, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            "x-auth-token": userToken
        },
    })
    const data = await res.json()
    return data
}

export default removeVacation