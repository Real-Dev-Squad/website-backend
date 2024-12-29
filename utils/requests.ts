export const getNewDeadline = (currentDate: number, oldEndsOn: number, numberOfDaysInMillisecond: number) => {
    if(currentDate > oldEndsOn){
        return currentDate + numberOfDaysInMillisecond;
    }
    return oldEndsOn + numberOfDaysInMillisecond;
}

export const convertDateStringToMilliseconds = (date: string) => {
    const milliseconds = Date.parse(date);
    if(!milliseconds) {
        return {
            isDate: false,
        }
    }
    return {
        isDate: true,
        milliseconds,
    }
} 