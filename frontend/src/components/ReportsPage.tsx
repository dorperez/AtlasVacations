import "../styles/reportsPageStyle.scss"
import { useContext, useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import getAllVacations from '../functions/getAllVacations'
import getAllFollowers from '../functions/getAllFollowers'
import AuthContext from '../context/AuthContext'
import FollowingType from '../types/FollowingType'
import VacationType from '../types/VacationType'
import { showSnackbar } from "../functions/utils/snackbar"


const ReportsPage = () => {

    const authContext = useContext(AuthContext)
    const [allFollowers, setAllFollowers] = useState<any[]>([])
    const [allVacations, setAllVacations] = useState<any[]>([])
    const [chartList, setChartList] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [feedBackMessage, setFeedBackMessage] = useState<string | null>(null)

    useEffect(() => {
        const fetchAll = async () => {
            const token = authContext.userToken

            if (!token) {
                //console.log("No auth token found.")
                return
            }

            try {
                const [vacationsResponse, followersResponse] = await Promise.all([
                    getAllVacations(token),
                    getAllFollowers(token)
                ])

                setAllFollowers(followersResponse.data)
                setAllVacations(vacationsResponse.data)
                setIsLoading(false)
                setFeedBackMessage(null)
                // Ensure the response data is an array
                const allVacations = vacationsResponse.data || []
                const allFollowers = followersResponse.data || []


                const chartList = allVacations.map((vacation: VacationType) => {
                    const followingCount = allFollowers.filter((followersRow: FollowingType) => followersRow.vacationID === vacation.vacationID).length
                    return {
                        name: vacation.title, // Adjust as needed (vacation.title or vacation.vacationID)
                        Followers: followingCount
                    }
                })

                const filteredChartList = chartList.filter((item: any) => item.Followers > 0)
                setChartList(filteredChartList)

            } catch (err: any) {
                console.error("Error:", err.message)
                setFeedBackMessage(err.message)
            }
        }

        fetchAll()
        //console.log("ReportsPage mounted")

        return () => {
            //console.log("ReportsPage unmounted")
        }
    }, [authContext.userToken])

    useEffect(() => {
        //console.log(chartList)
    }, [chartList])

    const handleExportToCSV = () => {
        const headers = "Destination,Followers"
        const rows = chartList.map(e => `${e.name},${e.followers}`)
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "vacation_followers_report.csv")
        document.body.appendChild(link)
        link.click()
        showSnackbar("Loading ...")
        document.body.removeChild(link)
    }

    return feedBackMessage ? <h2>{feedBackMessage}</h2> : (
        <div className='reportsPageContainer'>
            <h2>Vacations Report:</h2>
            <div className="detailsContainer">
                <h4>Total Vacations: <span>{allVacations.length}</span></h4>
                <h4>Total Followers: <span>{allFollowers.length}</span></h4>
            </div>
            {chartList.length !== 0 && <button onClick={handleExportToCSV} className="exportButtonn">Export To CSV</button>}

            {chartList.length === 0 ? <h3>No one liked any of the vacations so theres nothing to show ...</h3> :

                <div className='chartContainer'>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartList}
                            margin={{ top: 70, right: 30, left: 30, bottom: 80 }}
                        >
                            <CartesianGrid horizontal={false} vertical={false} />
                            <XAxis
                                dataKey="name"
                                interval={0}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                domain={[0, 'dataMax']}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
                            />
                            <Tooltip cursor={false} />
                            <Bar
                                dataKey="Followers"
                                fill="#328399"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>}
        </div>
    )
}

export default ReportsPage
