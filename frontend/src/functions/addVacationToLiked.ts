const addVacationToLiked = async (userToken: string, userID: number, vacationID: number) => {
    const url = `http://localhost:3000/addToLikedVacations`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": userToken },
        body: JSON.stringify({ userID, vacationID })
    })
    const data = await res.json()
    return data
}

export default addVacationToLiked