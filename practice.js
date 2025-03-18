// let dhoni={
//     Name:"Mahendra Singh Dhoni",
//     Age:42,
//     isHeCool:true,
//     teamsPlayed:["India","CSK"],
//     Statistics:{
//         Matches:538,
//         Runs:17266,
//         Centuries:16,
//     },
//     retire:function (){
//         console.log(`${dhoni.Name} retired from international cricket in 2020`);
//     }
// }
// console.log(dhoni.Name);
// console.log(dhoni.Statistics.Runs);
// console.log(dhoni.teamsPlayed[0]);
// console.log(dhoni.retire());


// let calculator={
//     add:function(a,b){
//         console.log(a+b);
//     },
//     substract:function(a,b){
//         console.log(a-b);
//     },
//     multiply:function(a,b){
//         console.log(a*b);
//     },
// }
// calculator.add(5,3),
// calculator.substract(5,3)
// calculator.multiply(5,3)

// const library={
//     name:"suresh",
//     books:[],
//     totalbooks:0,
//     addBook:function(title){
//         this.books.push(title);
//         this.totalbooks+=1;
//     }
// }
// library.addBook("book1");
// library.addBook("book1");
// library.addBook("book1");

// console.log(library.books)
// console.log(library.totalbooks)

// const obj1={
//     1:[
//         "raj","hello",
//     ],
//     2:[
//         "class2", "class2111"
//     ]
// }
// let class1=document.querySelcetor(".class1");
// let class2=document.querySelcetor(".class2");
// let day1=document.querySelcetor(".day1");
// let day2=document.querySelcetor(".day2");
// class1.addEventListener("click",()=>{
//     day1.addEventLister("click",()=>{
//         p.textContent=obj1.class1.dataset.class[day1.dataset.day]
//     })
// })

let text = document.querySelector(".para");


function toggleText() {
    var text = document.getElementById("text");
    text.hidden = !text.hidden; // Toggle the 'hidden' property
}
