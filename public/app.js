const articlesElement = document.querySelector('#articles');

// get response from  our
async function hi() {
    // reset list so refresch doesnt duplicate data
    let list = ""
    // request the data from index.js server 
    const response = await fetch('/api/articles');
    list = await response.json()
    console.log('fuckkk')
    document.querySelector(".loader").remove();
    // clear previous listings

    list.forEach(element => {
        // create div
        const newDiv = document.createElement('div')
        // add line

        const line = document.createElement("hr")
        // create content 

        const article = document.createElement('a');
        article.setAttribute('href', element.link)

        // add image
        const img = document.createElement('img');
        if (element.img) {
            img.setAttribute('src', element.img)
        }
        else {
            img.src = "./vital_logo.png"
            // height set for desktop
            img.setAttribute("height", '133px')
            img.setAttribute('class', 'vital_img')
        }

        // img.src = "./vital_logo.png"
        img.onclick = () => {
            window.location.href = element.link;
        }
        // if (element.img) { newDiv.appendChild(img) }
        newDiv.appendChild(img)

        // set title
        article.innerHTML = element.title

        // create new div for title and comment number
        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('class', 'sectionContent')

        // create comment number section
        const comment = document.createElement('p');
        comment.innerHTML = element.commentNumber;
        if (element.commentNumber === undefined) { comment.innerHTML = "" }

        // add title and comment number to contentDiv
        contentDiv.appendChild(article);
        contentDiv.appendChild(comment)

        // add content to div
        newDiv.appendChild(contentDiv)

        // add newDiv and horizontal line separatley, so horizontal line doesn't go vertical when we use display: flex.... good fix
        articlesElement.appendChild(line)
        articlesElement.append(newDiv)
    });
    // console.log(list.)
    // test
    // testing 123

}

hi()

