// import jquery from "./lib/jquery";

const test = {
    a: "a",
    b: "b"
};

const test2 = {
    c: "c",
    d: "d"
};

const finalTest = {
    ...test,
    ...test2,
    jquery: jquery
};

function contoh(a = "asd") {
    console.log(a);
}

console.log(finalTest);
console.log(contoh("contoh"));
