const removeVacationFromLiked = async (userToken: string, userID: number, vacationID: number) => {
    const url = `http://localhost:3000/removeFromLikedVacations`
    const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-auth-token": userToken },
        body: JSON.stringify({ userID, vacationID })
    })
    const data = await res.json()
    return data
}

export default removeVacationFromLiked