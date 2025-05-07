const getAllVacations = async () => {
    const url = "http://localhost:3000/vacations"
    const res = await fetch(url)
    const data = await res.json()
    return data
}