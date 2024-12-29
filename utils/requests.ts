export const getNewDeadline = (currentDate: number, oldEndsOn: number, numberOfDaysInMillisecond: number) => {
    if(currentDate > oldEndsOn){
        return currentDate + numberOfDaysInMillisecond;
    }
    return oldEndsOn + numberOfDaysInMillisecond;
}
