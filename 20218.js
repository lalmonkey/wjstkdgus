const express = require('express')
const fs = require ('fs')
const qs = require ('querystring')
const app = express()
const port = 3000

const template = require('/HTML/tem.js')

app.get('/', (req,res)=>{
    // const q = req.query
    // const name = q.name
    let{name} = req.query
    fs.readdir('page', (err,files) => {
        let list = template.list(files)
        fs.readFile(`page/${name}` , 'utf-8' , (err,data) => {
            let control = `<a href="/create">글 작성</a> <a href="/update?name=${name}">수정</a>
            <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${name}">
                <button type="submit">삭제</button>
            </form>
            `
            if(name === undefined) {
                name = '공지사항';
                data = '자유롭게 대화하세요';
                control = `<a href="/create">글 작성</a>`;
            }
            const html = template.HTML(name, list,`<h2>${name}</h2><p>${data}</p>`, control)
            res.send(html)
        })
    
    })
})

app.get('/create' , (req, res)=>{
    fs.readdir('page', (err,files) => {
        const name = 'create'
        const list = template.list(files)
        const data = template.create()
        const html = template.HTML(name , list , data, '')
        res.send(html)
    })
})

app.get('/update', (req, res)=>{
    let {name} = req.query
    fs.readdir('page', (err,files) => {
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err,content) => {
            let control = `<a href="/create">글 작성</a> <a href="/update?name=${name}">수정</a>
            <form action="delete_process" method="post">
                <input type='hidden' name='id' value='${name}'>
                <button type="submit">삭제</button>
            </form>
            `
            const data = template.update(name, content)
            const html = template.HTML(name, list, `<h2>${name} ---글 수정 중---</h2><p>${data}</p>`, control)
            res.send(html)
        })
    })
})
app.post('/create_process', (req, res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    })
    req.on('end', ()=>{
        const post = qs.parse(body)
        const title = post.title
        const description = post.description
        fs.writeFile(`page/${title}`, description, 'utf8' , (err)=>{
            res.redirect(302,`/?name=${title}`)
        })
    })
})

app.post('/update_process' , function(req,res){
    let body = ''

    req.on('data' , (data) => {
        body = body + data
    })
    req.on('end', () => {
        const post = qs.parse(body)
        const id = post.id
        const title = post.title
        const description = post.description
        fs.rename(`page/${id}` , `page/${title}` , (err) => {
            fs.writeFile(`page/${title}` , description , 'utf8' , (err) => {
                res.redirect(302, `/?name=${title}`)    
            })
        })
    })

})

app.post('/delete_process',(req, res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    })
    req.on('end', ()=>{
        const post = qs.parse(body)
        const id = post.id
        fs.unlink(`page/${id}`, (err)=>{
            res.redirect(302,`/`)
        })
    })
})
app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})
