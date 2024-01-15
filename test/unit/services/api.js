// async function wait() {
//   return new Promise((res) => {
//     setTimeout(res, 2300);
//   });
// }

// async function cdf() {
//   const arr = [];
//   arr.length = 23;
//   let i = 1;
//   for await (const iterator of arr) {
//     const res = await fetch("/data?part=" + i, { headers: { "Content-Type": "application/json" } }).catch(() => {
//       console.log("error=> ", i);
//     });
//     arr[i - 1] = res;
//     i += 1;

//     // let fds = await res.json();
//     // console.log("fds", fds.data);
//     await wait();
//   }
//   let res = await Promise.all(arr.map((r) => r.json()));
//   res = res.map((d) => d.data);
//   const response = [];
//   for (let i = 0; i < res.length; i++) {
//     const [left, right] = res[i].join("").split("➡➡➡");
//     let curr = [null, null];

//     curr[0] = conv(left);
//     curr[1] = conv(right);
//     // curr.
//     response.push(curr);
//   }
//   console.log(
//     "first",
//     response
//       .sort((a, b) => a[0] - b[0])
//       .map((d) => d[1])
//       .join("")
//   );
// }

// const morseCode1 = {
//   A: ".-",
//   B: "-...",
//   C: "-.-.",
//   D: "-..",
//   E: ".",
//   F: "..-.",
//   G: "--.",
//   H: "....",
//   I: "..",
//   J: ".---",
//   K: "-.-",
//   L: ".-..",
//   M: "--",
//   N: "-.",
//   O: "---",
//   P: ".--.",
//   Q: "--.-",
//   R: ".-.",
//   S: "...",
//   T: "-",
//   U: "..-",
//   V: "...-",
//   W: ".--",
//   X: "-..-",
//   Y: "-.--",
//   Z: "--..",
//   0: "-----",
//   1: ".----",
//   2: "..---",
//   3: "...--",
//   4: "....-",
//   5: ".....",
//   6: "-....",
//   7: "--...",
//   8: "---..",
//   9: "----.",
// };
// const morseCode = {};
// for (let i = 0; i < Object.entries(morseCode1).length; i++) {
//   morseCode[Object.entries(morseCode1)[i][1]] = Object.entries(morseCode1)[i][0];
// }

// const conv = (left) => {
//   if (left.length <= 5) {
//     return morseCode[left];
//   }
//   return morseCode[left.slice(0, 5)] + morseCode[left.slice(5)];
// };
// cdf();

// fetch('/answers', {
//   method: "POST", // *GET, POST, PUT, DELETE, etc.
//   mode: "cors", // no-cors, *cors, same-origin
//   cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//   credentials: "same-origin", // include, *same-origin, omit
//   headers: {
//     "Content-Type": "application/json",
//     // 'Content-Type': 'application/x-www-form-urlencoded',
//   },
//   redirect: "follow", // manual, *follow, error
//   referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//   body: JSON.stringify({chaincode:''}), // body data type must match "Content-Type" header
// });
// //  🎉🎉 ✅ CONGRATULATIONS! ✅ 🎉🎉 -- YOU DID IT! Please Save this link: https://exam.ankush.wiki/submissions?key=659b0628e6d565672a18
