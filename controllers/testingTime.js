let time = new Date();
console.log(time)
if (time.getHours() >= 5) {
    time.setHours(5,0,1)
    console.log(time)
    //right now uses UTC which is 4 hours ahead
} else {
    time.setHours(5,0,1);
    time.setDate(time.getDate() - 1);
    console.log(time)
} 