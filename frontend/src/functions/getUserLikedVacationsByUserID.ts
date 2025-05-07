const getUserLikedBacationsByUserID = async (userToken: string, userID: number) => {
    const url = `http://localhost:3000/user/${userID}/vacations`
    const res = await fetch(url, {
        method:"GET",
        headers: { "x-auth-token": userToken }
    })
    const data = await res.json()
    return data
}

export default getUserLikedBacationsByUserID