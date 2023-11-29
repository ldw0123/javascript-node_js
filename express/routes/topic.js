// topic 주소
const express = require('express'); // express 모듈 로드
const router = express.Router(); // express.Router() 메서드 호출

app.get('/topic/create', function (req, res) {
  var title = 'WEB - create';
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `,
    ''
  );
  res.send(html);
});

app.post('/topic/create_process', function (req, res) {
  var post = req.body; // body-parser
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    res.redirect(`/topic/${title}`);
  });
});

app.get('/topic/update/:pageId', function (req, res) {
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    var title = req.params.pageId;
    var list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
      `<a href="/topic/create">create</a> <a href="/topic/update?id=${title}">update</a>`
    );
    res.send(html);
  });
});

app.post('/topic/update_process', function (req, res) {
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      res.redirect(`/topic/${title}`);
    });
  });
});

app.post('/topic/delete_process', function (req, res) {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    res.redirect('/');
  });
});

// 동적 라우팅에는 ':' 를 붙인다 /page/:pageId
app.get('/topic/:pageId', function (req, res, next) {
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    if (err) {
      // error가 발생하면
      next(err); // error 데이터 전달
    } else {
      var title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1'],
      });
      var list = template.list(req.list);
      var html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
      );
      res.send(html);
    }
  });
});
