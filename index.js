/// querySelector on steroids
const $ = function(selector) { return (document.querySelectorAll(selector).length > 1) ? document.querySelectorAll(selector) : document.querySelector(selector) }

/// Replaces all occurences of str1 in str2
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2)
}

/// Turns string with URLs to string with <a/> elements
String.prototype.linkify = function() {
    // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim

    // Email addresses
    var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim

    return this
        .replace(urlPattern, '<a href="$&">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>')
}

/// Extract all the files as global variables
var course, teachers, announcements, courseWork, courseWorkMaterials, topics

/// Current loading progress
/// Whole app loading is separated to sections
/// 1) Load all the JSON's
/// 2) Populate annoucements
/// 3) Populate Work
/// 4) Populate Materials
/// 5) Finalization
var loadingProgress = 0

/// Returns teacher by it's userId
function GetTeacher(id) {
    for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].userId == id) {
            return teachers[i]
        }
    }
}

/// Returns topic by it's id
function GetTopic(id) {
    for (var i = 0; i < topics.length; i++) {
        if (topics[i].topicID = id) {
            return topics[i]
        }
    }
}

function GetWork(id) {
    var result = [];
    for (var i = 0; i < courseWork.length; i++) {
        if(courseWork[i].topicId == id) {
            result.push(courseWork[i])
        }
    }
    return result;
}

function UpdateProgress(progress) {
    loadingProgress = progress
}

/// Changes current active tab
function ChangeTab(event, tab) {
    for (var i = 0; i < $(".tab-container").length; i++) {
        $(".tab-container")[i].style.display = "none"
        $(".tabs").children[i].classList.remove("tab-active")
    }
    $(`.${tab}`).style.display = ""
    if(event != null) {
        event.currentTarget.classList.add("tab-active")
    } else {
        $(`#${tab}`).classList.add("tab-active")
    }
}

/// Opens selected work card
function OpenWork(event) {
    if(eval(event.currentTarget.dataset.isExpanded) == true) {
        event.currentTarget.dataset.isExpanded = false
        event.currentTarget.style.height = "";
    } else {
        event.currentTarget.dataset.isExpanded = true
        event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
    }
}

/// Wait untill window loads everything by displaying a circular progress
window.addEventListener('load', async () => {
    var start = performance.now()

    /// Get all the course information from JSONs
    course              = await fetch("classroom-backup-data/course.json").then(response => response.json())
    UpdateProgress(0.03) 

    teachers            = await fetch("classroom-backup-data/course.teachers.json").then(response => response.json()).then(json => json.teachers)
    UpdateProgress(0.06) 

    announcements       = await fetch("classroom-backup-data/course.announcements.json").then(response => response.json()).then(json => json.announcements)
    UpdateProgress(0.09) 

    courseWork          = await fetch("classroom-backup-data/course.courseWork.json").then(response => response.json()).then(json => json.courseWork)
    UpdateProgress(0.12) 

    courseWorkMaterials = await fetch("classroom-backup-data/course.courseWorkMaterials.json").then(response => response.json()).then(json => json.courseWorkMaterial)
    UpdateProgress(0.15) 

    topics              = await fetch("classroom-backup-data/course.topics.json").then(response => response.json()).then(json => json.topic)
    UpdateProgress(0.18) 


    $(".room-title").innerHTML = course.name;
    $(".room-subtitle").innerHTML = course.section;

    $(".header-title").innerHTML = course.name;
    $(".header-subtitle").innerHTML = course.section;

    UpdateProgress(0.20) 

    /// Fill up announcements
    for (var i = 0; i < announcements.length; i++) {
        var teacher = GetTeacher(announcements[i].creatorUserId)
        var date = new Date(announcements[i].updateTime);
        if (teacher != undefined) {
            $(".announcements").innerHTML += `<div class="card announcement">
                <div class="card-header">
                    <img class="card-header-avatar" src="https:${teacher.profile.photoUrl}"></img>
                    <div class="card-header-information">
                        <div class="card-header-username">${teacher.profile.name.fullName}</div>
                        <div class="card-header-timestamp">${date.toLocaleString("cs-CZ", { day: "numeric", month: "short" })}</div>
                    </div>
                </div>
                <div class="card-content">
                    <span>${announcements[i].text.trim().replaceAll("\n", "<br/>").linkify()}</span>
                </div>
                <div class="card-footer">
                    <a href="${announcements[i].alternateLink}" class="outlined-button" target="_blank">Otevřit original</a>
                </div>
            </div>`
        } else {
            $(".announcements").innerHTML += `<div class="card announcement">
                <div class="card-header">
                    <img class="card-header-avatar" src="https://services.lecocqassociate.com/files/file/5f9821438d00210019d33809/2020/11/de6589f0-2359-11eb-ae21-758444039e75.jpg"></img>
                    <div class="card-header-information">
                        <div class="card-header-username">Student</div>
                        <div class="card-header-timestamp">${date.toLocaleString("en-US", { day: "numeric", month: "short" })}</div>
                    </div>
                </div>
                <div class="card-content">
                    <span>Tato zpráva byla napsána studentem, ale jeho údaje Google neumožňuje zobrazit<hr/>${announcements[i].text.trim().replaceAll("\n", "<br/>").linkify()}</span>
                </div>
                <div class="card-footer">
                    <a href="${announcements[i].alternateLink}" class="outlined-button" target="_blank">Otevřit original</a>
                </div>
            </div>`
        }
    }
    UpdateProgress(0.40)

    /// Fill up work
    /// could contain <description>
    for (var i = 0; i < topics.length; i++) {
        var result = "";
        var work = GetWork(topics[i].topicId)

        if (work.length != 0) {
            result += `
                <div class="topic">
                    <div class="topic-header">${topics[i].name}</div>`


            for (var j = 0; j < work.length; j++) {
                var creationTime = new Date(work[j].creationTime);
                var updTime = new Date(work[j].updateTime);
                var teacher = GetTeacher(work[j].creatorUserId);
                if (work[j].dueDate != undefined) {
                    var due = `Do ${(new Date(
                        work[j].dueDate.year || null,
                        work[j].dueDate.month || null,
                        work[j].dueDate.day || null,
                        work[j].dueTime.hours || null,
                        work[j].dueTime.minutes || null,
                        work[j].dueTime.seconds || null
                    )).toLocaleString("cs-CZ")}`
                } else {
                    var due = "Žádný termín odevzdání"
                }

                //#region 
                /// possible options are
                /// -- driveFile
                /// ---- driveFile  
                /// ------ id
                /// ------ title
                /// ------ alternateLink
                /// ------ thumbnailUrl
                /// ---- shareMode
                
                /// -- form
                /// ---- formUrl
                /// ---- title
                /// ---- thumbnailUrl

                /// -- youtubeVideo
                /// ---- id
                /// ---- title
                /// ---- alternatelink
                /// ---- thumbnailUrl

                /// -- link
                /// ---- url
                /// ---- title
                /// ---- thumbnailUrl
                //#endregion
                if (work[j].materials != undefined) {
                    var attachments = `<div class="work-card-attachments">`
                    work[j].materials.forEach(attachment => {
                        if (attachment.driveFile != undefined) { /// att. of type driveFile
                            var title = "Tento soubor byl smazán majitelem"
                            var attachmentType = "Neznámý typ souboru"
                            /// Detect attachmet type if it's not deleted
                            if (attachment.driveFile.driveFile.title != undefined && attachment.driveFile.driveFile.thumbnailUrl != undefined) { 
                                if (attachment.driveFile.driveFile.alternateLink.indexOf("docs") != -1
                                    || attachment.driveFile.driveFile.title.indexOf("docx") != -1) {
                                    attachmentType = "Dokument"
                                } else if (attachment.driveFile.driveFile.title.indexOf("wav") != -1) {
                                    attachmentType = "Audio"
                                } else if (attachment.driveFile.driveFile.title.indexOf("mp4") != -1
                                    || attachment.driveFile.driveFile.title.indexOf("avi") != -1
                                    || attachment.driveFile.driveFile.title.indexOf("mkv") != -1) {
                                    attachmentType = "Video"
                                } else if (attachment.driveFile.driveFile.title.indexOf("jpg") != -1 
                                    || attachment.driveFile.driveFile.title.indexOf("jpeg") != -1
                                    || attachment.driveFile.driveFile.title.indexOf("png") != -1
                                    || attachment.driveFile.driveFile.title.indexOf("gif") != -1) {
                                    attachmentType = "Obrázek"
                                }
                                title = attachment.driveFile.driveFile.title
                            } else {
                                attachmentType = ""
                            }
                            attachments += `
                            <a class="attachment" target="_blank" href="${attachment.driveFile.driveFile.alternateLink}">
                                <div class="attachment-img-container">
                                    <img class="attachment-image" src="${attachment.driveFile.driveFile.thumbnailUrl}"></img>
                                </div>
                                <div class="attachment-titles">
                                    <div class="attachment-title">${title}</div>
                                    <div class="attachment-subtitle">${attachmentType}</div>
                                </div>
                            </a>
                            `
                        } else if (attachment.form != undefined) { /// att. of type form
                            attachments += `
                            <a class="attachment" target="_blank" href="${attachment.form.formUrl}">
                                <div class="attachment-img-container">
                                    <img class="attachment-image" src="${attachment.form.thumbnailUrl}"></img>
                                </div>
                                <div class="attachment-titles">
                                    <div class="attachment-title">${attachment.form.title}</div>
                                    <div class="attachment-subtitle">Form</div>
                                </div>
                            </a>
                            `
                        } else if (attachment.youtubeVideo != undefined) { /// att. of type youtubeVideo
                            attachments += `
                            <a class="attachment" target="_blank" href="${attachment.youtubeVideo.alternateLink}">
                                <div class="attachment-img-container">
                                    <img class="attachment-image" src="${attachment.youtubeVideo.thumbnailUrl}"></img>
                                </div>
                                <div class="attachment-titles">
                                    <div class="attachment-title">${attachment.youtubeVideo.title}</div>
                                    <div class="attachment-subtitle">YouTube Video</div>
                                </div>
                            </a>
                            `
                        } else if (attachment.link != undefined) { /// att. of type link
                            attachments += `
                            <a class="attachment" target="_blank" href="${attachment.link.alternateLink}">
                                <div class="attachment-img-container">
                                    <img class="attachment-image" src="${attachment.link.thumbnailUrl}"></img>
                                </div>
                                <div class="attachment-titles">
                                    <div class="attachment-title">${attachment.link.title}</div>
                                    <div class="attachment-subtitle">Externí odkaz</div>
                                </div>
                            </a>
                            `
                        }
                    })
                    attachments += "</div>"
                } else {
                    var attachments = ""
                }
                result +=
                    `<div class="work-content card" data-is-expanded="false" onclick="OpenWork(event, 'card')">
                        <div class="card-header">
                            <img class="card-header-avatar work-avatar" src="img/work.svg"></img>
                            <div class="card-header-title">
                                <div class="work-title">${work[j].title}</div>
                                <div class="work-date">${due}</div>
                            </div>
                        </div>
                        <div class="card-content">
                            ${work[j].description != undefined ? work[j].description.trim().replaceAll("\n", "<br/>").linkify() : ""}
                            ${attachments}
                        </div>
                        <div class="card-footer">${teacher.profile.name.fullName} • ${creationTime.toLocaleDateString("cs-CZ")} (Upraveno ${updTime.toLocaleDateString("cs-CZ")}) • Maximální výsledek: ${work[j].maxPoints}</div>
                    </div>`
            }        
            result += "</div>"
        }
        
        $(".tab-work").innerHTML += result
    }

    // for (var i = 0; i < courseWork.length; i++) {
    //     var topic = GetTopic(courseWork[i].topicId)
    // }

    UpdateProgress(0.60)

    ChangeTab(null, 'tab-work')

    UpdateProgress(1)
    
    var end = performance.now()
    $(".footer-build-information").innerHTML = `Postaveno za ${Math.round(end - start)} ms`
    console.info(`Built in ${Math.round(end - start)} ms`)
    
})


window.addEventListener('scroll', () => {
    if (window.scrollY >= 32) {
        $(".navigation").style.boxShadow = "0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%)"
        $(".navigation").style.borderBottom = "0 solid #e0e0e0"
    } else {
        $(".navigation").style.boxShadow = "0 0 0 0"
        $(".navigation").style.borderBottom = "0.0625rem solid #e0e0e0"
    }
})

