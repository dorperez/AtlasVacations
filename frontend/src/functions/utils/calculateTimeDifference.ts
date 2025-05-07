const calculateTimeDifference = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const timeDifference = end.getTime() - start.getTime();

    const days = Math.floor(timeDifference / (1000 * 3600 * 24));

    const months = Math.floor(days / 30);
    const remainingDays = days % 30;

    if (months > 0) {
        return `${months} months ${remainingDays} days`;
    } else {
        return `${days} days`;
    }
};

export default calculateTimeDifference