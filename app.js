const express = require("express");
const app = express();
const port = 3000;

const _ = require("lodash");

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://ThakurRJ:mongowithRJ@18@list.ibzb0.mongodb.net/tododb", { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

const listArray = ["DAS", "Web-Dev"];


const listSchema = new mongoose.Schema({
    name: String
});

const List = new mongoose.model("List", listSchema);

const list1 = new List({
    name: "Add by clicking + button"
});

const listarray = [list1];

const customSchema = new mongoose.Schema({
    name: String,
    CustomItems: [listSchema]
});

const CustomList = new mongoose.model("CustomList", customSchema);


app.get("/", (req, res) => {

    List.find({}, (err, DataItem) => {

        if (DataItem.length === 0) {
            List.insertMany(listarray, (err) => {
                if (err)
                    console.log("error....")
            });
            res.redirect("/");
        } else {
            res.render("app", { title: "Today", newItems: DataItem });
        }
    });
});



app.get("/:customRoute", (req, res) => {
    const CustomRoute = _.capitalize(req.params.customRoute);

    CustomList.findOne({ name: CustomRoute }, function (err, result) {
        if (!err) {
            if (!result) {
                const customlist = new CustomList({
                    name: CustomRoute,
                    CustomItems: listarray
                });
                customlist.save();
                res.redirect("/" + CustomRoute);
            }
            else {
                res.render("app", { title: result.name, newItems: result.CustomItems })
            }
        }
    })






});

app.post("/", function (req, res) {
    let item = _.capitalize(req.body.input);
    let itemname = req.body.add;

    const addList = new List({
        name: item
    });
    if (itemname === "Today") {
        addList.save();
        res.redirect("/");
    }
    else {
        CustomList.findOne({ name: itemname }, (err, found) => {
            found.CustomItems.push(addList);
            found.save();
            res.redirect("/" + itemname);
        });
    }
});

app.post("/delete", (req, res) => {
    const itemID = req.body.check;
    const deleteItem = req.body.del;

    if (deleteItem === "Today") {
        List.findByIdAndRemove(itemID, (err) => {
            if (!err) {

                res.redirect("/");
            }
        });
    }
    else {
        CustomList.findOneAndUpdate({ name: deleteItem }, { $pull: { CustomItems: { _id: itemID } } }, (err, del) => {
            if (!err) {
                res.redirect("/" + deleteItem);
            }
        });

    }


});





app.listen(port, () => {
    console.log("Ya bro all things are working fine");
})

// CustomList.findOne({ name: CustomRoute }, (err, Present) => {
//     if (!err) {
//         if (!Present) {
//             const customlist = new CustomList({
//                 name: CustomRoute,
//                 CustomItems: listarray
//             });
//             customlist.save();
//             res.redirect("/" + CustomRoute);
//         }
//         else {
//             res.render("app", { title: Present.name, newItems: Present.items })
//         }
//     }
// });