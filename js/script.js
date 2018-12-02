loadNap = () => {
    // main = document.getElementById("")
    window.addEventListener('dragover', function (ev) {
        ev.preventDefault();
    });
    window.addEventListener('drop', function (ev) {
        ev.preventDefault();
        datax = ev.dataTransfer.getData('text/html');
        console.log(ev.dataTransfer.getData('text/html'))
        console.log(ev.dataTransfer.files[0])


        let payload = {
            type: "newnote",
            pageId: $('main').data('pageid'),
            content: {
                body: datax
            }
        };
        $.post("http://localhost:1090/edit", payload).then(function (data) {
            data = JSON.parse(data);
            d = $($(".note.template[data-folder=false]")[0]);
            jQuery(d).draggable("destroy");
            let temp = $(".note[data-id='" + (d.data('id')) + "']").removeClass("ui-resizable edit").clone(true, true);
            temp.attr('data-id', (data.ops[0])._id);
            temp.find(".notehead").removeClass().addClass("notehead");
            temp.find(".content p").text(datax);
            $(".notes").append(temp);
            let sel = $(".note[data-id='" + (data.ops[0])._id + "']");
            $(sel).data('id', (data.ops[0])._id);
            $(sel).removeClass('template');
            $(sel).css({
                top: "90px",
                left: "10px",
                width: "150px",
                height: "100px"
            });
            $(sel[0]).find(".content p").focus();
            newElementInit(sel[0]);
            $(sel[0]).draggable(uiDragNoteOps);
            makeEdits(sel[0]);
            window.getSelection().selectAllChildren($(sel[0]).find(".content p")[0]);
            jQuery(d).draggable(uiDragNoteOps);

        })


    });




}

$(document).ready(loadNap)



let resized, renamed;

uiDragNoteOps = {
    containment: "main",
    stack: ".note",
    distance: 1,
    grid: [10, 5],
    stop: updateEleDim
}

$("note").draggable(uiDragNoteOps);

function updateEleDim(event, ui) {
    // console.log("Drageventstop");
    // console.log(event);
    // console.log(ui);
    toEleId = $(event.toElement).closest(".folder").data("target");
    let upData = {};
    upData._id = $(this).data("id");
    if (toEleId && !$(this).data("folder")) {
        upData.type = "move";
        upData.pageId = toEleId;
        $(this).addClass("removeNote");
        setTimeout(function () {
            $(this).remove();
        }, 500)
    } else {
        let z = $(ui.helper[0]).css('z-index');
        console.log(z)
        if (event.type === "resizestop") {
            // Update ui.size to the DB
            upData.dim = ui.size;
            upData.type = "resize";
        } else if (event.type === "dragstop") {
            // Update ui.offset to the DB
            upData.dim = ui.offset;
            upData.type = "drag";
        }


    }

    //upData.dim.z = z;
    $.post("http://localhost:1090/update", upData)
    updateZindex();
}


function makeEdits(ele) {
    if ($(".edit").length > 0) {
        if ($(resized).resizable("instance"))
            jQuery(resized).resizable("destroy");
        $(resized).removeClass("edit");
        $(resized).draggable(uiDragNoteOps);
        $(resized).closest(".note").find(".content").removeAttr("contenteditable");
    }
    $(ele).addClass("edit");
    var sel = $(ele).closest(".note").find(".content").attr("contenteditable", true).focus();
    jQuery(ele).draggable("destroy");
    console.log(ele);
    jQuery(ele).resizable({
        grid: [10, 5],
        stop: updateEleDim
    });
    resized = ele;
}







function updateZindex() {
    let eles = $(".note");
    for (let i = 0; i < eles.length; i++) {
        let t = $(eles[i]).css("z-index");
        let id = $(eles[i]).data("id");
        if (t) {
            $.post("http://localhost:1090/update", {
                _id: id,
                z: t,
                type: 'zindex'
            });
        }
    }
}

function getScope(ctrlName) {
    var sel = 'section[ng-controller="' + ctrlName + '"]';
    return angular.element(sel).scope();
}

function elementsInit() {
    $(".note").draggable(uiDragNoteOps);
    $(".note").dblclick(function () {

        if ($(this).hasClass("folder")) {
            console.log("is a folder");
            return
        }

        makeEdits(this);
    });

    $(".folder").draggable({
        containment: "main",
        grid: [10, 5],
        stop: updateEleDim
    });

    function newElementInit(ele) {
        console.log(ele)
        $(ele).dblclick(function () {

            if ($(this).hasClass("folder")) {
                console.log("is a folder");
                return
            }

            makeEdits(this);
        });
        jQuery(ele).resizable({
            grid: [10, 5],
            stop: updateEleDim
        });
    }
    $('.ops li .fa').click(function (e) {
        let payload = {};
        let note;
        let ele = $(e.target);
        note = $(this).closest('.note');
        payload.id = note.data("id");
        if ($(ele).hasClass('trash')) {
            if (confirm("Are you sure?"))
                payload.type = "delete";
            else
                return;
        } else if ($(ele).hasClass('clone')) {
            payload.type = "clone";
        }

        $.post("http://localhost:1090/edit", payload).then(function (data) {
            let scope = getScope('main');
            if (payload.type == "clone") {
                data = JSON.parse(data);
                console.log(scope);
                jQuery.cache = jcacheInit;
                let temp = $(".note[data-id='" + (payload.id) + "']").removeClass("ui-resizable edit").clone(true, true);
                temp.data('id', (data.ops[0])._id)
                temp.animate({
                    top: "+=10",
                    left: "+=10"
                });
                $(".notes").append(temp);
                jQuery(temp).find(".ui-resizable-handle").remove()
                newElementInit(temp);
                $(temp).draggable(uiDragNoteOps);

            } else {
                console.log("deleting")
                console.log(note)
                jQuery.cache = jcacheInit;
                $(note).remove();

            }
        }, function () {

        });
        console.log(payload);
    })
    $('.notehead').click(function (e) {
        console.log(e);
        console.log("Note");
        console.log(this)
        $(this).find('.color').toggleClass("active");
    })
    $('.color').on("mouseleave", function () {
        $(this).removeClass("active")
    })
    $('.color li').click(function (e) {
        id = $(this).closest('.note').data("id");
        color = $(this).attr('class').split(" ")[0];
        payload = {
            id: id,
            color: color,
            type: 'strip'
        }
        $(this).closest('.notehead').removeClass().addClass('notehead').addClass(color);
        $.post("http://localhost:1090/edit", payload);
    })

    $('.folderb').click(function (e) {
        e.preventDefault();
        let scope = getScope('main');
        let payload = {
            type: "newfolder",
            pageId: $('main').data('pageid'),
            title: "New Folder"
        };
        $.post("http://localhost:1090/edit", payload).then(function (data) {
            data = JSON.parse(data);
            d = $($(".folder.template[data-folder=true]")[0]);
            jQuery(d).draggable("destroy");
            let temp = $(".folder[data-id='" + (d.data('id')) + "']").removeClass("ui-resizable edit").clone(true, true);
            temp.attr('data-id', (data.ops[0])._id);
            $(".notes").append(temp);
            let sel = $(".folder[data-id='" + (data.ops[0])._id + "']");
            $(sel).removeClass('template');
            $(sel).data('id', (data.ops[0])._id);
            $(sel).css({
                top: "90px",
                left: "10px"
            });
            console.log(sel)
            $(sel[0]).find(".title").focus();
            newElementInit(sel[0]);
            $(sel[0]).draggable(uiDragNoteOps);
            window.getSelection().selectAllChildren($(sel[0]).find(".title")[0]);
            jQuery(d).draggable(uiDragNoteOps);
        })
    })

    $('.noteb').click(function (e) {
        e.preventDefault();
        let scope = getScope('main');
        let payload = {
            type: "newnote",
            pageId: $('main').data('pageid'),
            title: "Enter Text Here"
        };
        $.post("http://localhost:1090/edit", payload).then(function (data) {
            data = JSON.parse(data);
            d = $($(".note.template[data-folder=false]")[0]);
            jQuery(d).draggable("destroy");
            let temp = $(".note[data-id='" + (d.data('id')) + "']").removeClass("ui-resizable edit").clone(true, true);
            temp.attr('data-id', (data.ops[0])._id);
            temp.find(".notehead").removeClass().addClass("notehead");
            temp.find(".content p").text("Enter Text Here...");
            $(".notes").append(temp);
            let sel = $(".note[data-id='" + (data.ops[0])._id + "']");
            $(sel).data('id', (data.ops[0])._id);
            $(sel).removeClass('template');
            $(sel).css({
                top: "90px",
                left: "10px",
                width: "150px",
                height: "100px"
            });
            $(sel[0]).find(".content p").focus();
            newElementInit(sel[0]);
            $(sel[0]).draggable(uiDragNoteOps);
            makeEdits(sel[0]);
            window.getSelection().selectAllChildren($(sel[0]).find(".content p")[0]);
            jQuery(d).draggable(uiDragNoteOps);

        })
    })

    $("main").click(function (ex) {
        clickEle = $(ex.toElement).closest(".folder");
        console.log(clickEle);
        console.log(ex);
        if (ex.shiftKey && clickEle.length != 0) {
            ex.preventDefault();
            payload = {
                type: 'delfolder',
                id: $(clickEle).closest(".folder").data("id")
            };
            // console.log(payload)
            $(this).remove()
            $.post("http://localhost:1090/edit", payload);
            return;

        }
        if (ex.ctrlKey && clickEle.length != 0) {
            ex.preventDefault();
            console.log("ready to rename")
            renamed = $(clickEle).find("p").attr("contenteditable", true).focus();
            return;
        }
        if (renamed) {
            payload = {
                type: 'folder',
                data: $(renamed).text(),
                id: $(renamed).closest(".folder").data("id")
            };
            // console.log(payload)
            $.post("http://localhost:1090/edit", payload);
            $(renamed).removeAttr("contenteditable")
            renamed = null;
        }
        clickedElement = $(ex.target).closest(".note").data("id");
        activeElement = $(resized).closest(".note").data("id");
        if (($(resized).resizable("instance") && (clickedElement != activeElement))) {
            $(resized).removeClass("edit");
            $(resized).closest(".note").find(".content").removeAttr("contenteditable");
            text = $(resized).closest(".note").find(".content").text();
            id = $(resized).closest(".note").data("id");
            payload = {
                id: id,
                text: text,
                type: "contents"
            }
            $.post("http://localhost:1090/edit", payload);
            $(resized).draggable(uiDragNoteOps);
            jQuery(resized).resizable("destroy");
        }

    })
    $(".fa.add").click(function () {
        $(this).toggleClass('open');
        $(".add-new").toggleClass('open');
    })



    $('main')
        .bind('dragenter dragover', false)
        .bind('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
            let payload = {};
            id = $(e.target).closest(".note").data("id");
            var data = $(e.originalEvent.dataTransfer.getData('text/html'));
            var txt = e.originalEvent.dataTransfer.getData("Text");
            // console.log(src);
            var img = data.attr('src');
            if (!img)
                img = data.find("img").attr('src');
            if (id) {
                // Add to the exisiting card
            } else {
                // create new card

            }

            var b64test = new RegExp("base64");
            if (b64test.test(img)) {
                payload.type = "base64";
                console.log("b64")
                payload.data = img;
            } else if (img) {
                payload.type = "image";
                payload.data = img;
            } else {
                payload.type = "text";
                payload.data = txt;
            }
        });
}