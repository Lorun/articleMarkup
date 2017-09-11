;(function($) {

    var offset = 0;
    var count = 5;
    var authorId = 1;
    var $comments = $('#comments');
    var $commentTemplate = $('#comment_tpl');
    var $commentsContainer = $('.commentsList');

    var api = {
        api_url: 'http://frontend-test.pingbull.com/pages/ruslan@lobarev.com/comments',
        getCommentsList: function(count, offset) {
            return $.get({
                url: this.api_url,
                dateType: 'json'
            }, {
                count: count ? count : 5,
                offset: offset ? offset : 0
            });
        },
        addComment: function(data) {
            return $.ajax({
                url: this.api_url,
                type: 'POST',
                dateType: 'json',
                data: data
            });
        },
        deleteComment: function(id) {
            return $.ajax({
                url: this.api_url + '/' + id,
                type: 'POST',
                dateType: 'json',
                data: {
                    _method: 'DELETE'
                }
            });
        },
        editComment: function(data) {
            return $.ajax({
                url: this.api_url + '/' + data.id,
                type: 'POST',
                dateType: 'json',
                data: {
                    _method: 'PUT',
                    content: data.content,
                    parent: data.parent
                }
            });
        },
        getComment: function(id) {
            return $.get({
                url: this.api_url + '/' + id,
                dateType: 'json'
            });
        }
    };


    function init() {
        loadComments();
    }

    function loadComments() {
        api
            .getCommentsList(count, offset)
            .then(appendCommentList);

        offset = offset + count;
    }

    function appendCommentList(data) {
        data.map(function(comment) {
            var commentElement = createComment($commentTemplate, comment);
            $commentsContainer.append(commentElement);

            if (comment.children.length > 0) {
                var commentChildContainer = commentElement.find('.comment-children');
                comment.children.map(function(child) {
                    commentChildContainer.append(createComment($commentTemplate, child, 'comment--child', comment.author.name));
                });
            }
        });
    }

    function createComment(tpl, comment, className, parentAuthorName) {
        var template = tpl.clone().attr('id', 'comment-'+comment.id);
        className && template.addClass(className);

        if (comment.author.id !== authorId) {
            template.find('.comment-delete').remove();
            template.find('.comment-edit').remove();
        }

        var date = new Date(comment.created_at);
        var dateHtml = '<i class="fa fa-clock-o"></i> <b>'+date.getYear() +'-'+ ('0' + date.getMonth()).slice(-2) +'-'+ ('0' + date.getDate()).slice(-2) + '</b> at <b>' + date.getHours()+':'+date.getMinutes()+'</b>';
        var $author = template.find('.comment-author');

        $author.text(comment.author.name);
        parentAuthorName && $author.after('<span class="comment-parentAuthor"><i class="fa fa-share"></i> '+parentAuthorName+'</span>');
        template.data('id', comment.id);
        template.find('.comment-avatar').css('background-image', 'url('+comment.author.avatar+')');
        template.find('.comment-content').text(comment.content);
        template.find('.comment-posted').html(dateHtml);
        template.show();
        return template;
    }


    function handleFormSubmit(callback) {
        return function(e) {
            e.preventDefault();
            var elements = e.target.elements;
            var id = +elements['id'].value;
            var parent_id = +elements['parent'].value;
            var data = {
                content: elements['content'].value,
                parent: parent_id !== 0 ? parent_id : null
            };

            if (data.content.length > 1) {
                var action = id ? api.editComment.bind(api) : api.addComment.bind(api);
                if (id) data.id = id;

                action(data).done(function(response) {
                    callback && callback(response);
                    e.target.reset();
                });
            } else {
                alert('The comment is too short!');
            }
        }
    }


    /* Submit form listener */
    $('#app_comments_form').on('submit', handleFormSubmit(function(comment) {
        $commentsContainer
            .prepend(createComment($commentTemplate, comment));
    }));


    /* Delete comment */
    $($comments).on('click', '.js-delete-comment', function(e) {
        e.preventDefault();
        var $comment = $(this).closest('.comment');
        var id = $comment.data('id');
        if (window.confirm('Are you sure you want to delete you comment?')) {
            api.deleteComment(id).then(function () {
                $comment.remove();
            });
        }
    });

    /* Reply comment */
    $($comments).on('click', '.js-show-reply', function(e) {
        e.preventDefault();
        var currentComment = $(this).closest('.comment');
        var replyFormContainer = currentComment.find('.comment-replyForm').first();
        var form = $('#app_comments_form').clone().attr('id', '');
        var cancelBtn = $('<a>').addClass('comment-closeReplyForm js-close-reply-form').html('<i class="fa fa-close"></i> Cancel');

        form[0].elements['parent'].value = currentComment.data('id');
        form[0].elements['content'].value = '';

        $('.comment-replyForm').html('');

        replyFormContainer
            .append(cancelBtn)
            .append(form);

        console.log(currentComment.find('.comment-author').text());
        form.on('submit', handleFormSubmit(function(comment) {
            cancelBtn.trigger('click');
            currentComment
                .find('.comment-children')
                .first()
                .append(createComment($commentTemplate, comment, 'comment--child', currentComment.find('.comment-author').text()));
        }));
    });

    /* Edit comment */
    $($comments).on('click', '.js-edit-comment', function(e) {
        e.preventDefault();
        var currentComment = $(this).closest('.comment');
        var replyFormContainer = currentComment.find('.comment-replyForm').first();
        var id = currentComment.data('id');
        var form = $('#app_comments_form').clone().attr('id', '');
        var cancelBtn = $('<a>').addClass('comment-closeReplyForm js-close-reply-form').html('<i class="fa fa-close"></i> Cancel');

        form.find('button').text('Edit comment');

        $('.comment-replyForm').html('');

        replyFormContainer
            .append(cancelBtn)
            .append(form);

        api.getComment(id).then(function(comment) {
            form[0].elements['id'].value = comment.id;
            form[0].elements['parent'].value = comment.parent;
            form[0].elements['content'].value = comment.content;

            form.on('submit', handleFormSubmit(function(comment) {
                cancelBtn.trigger('click');
                currentComment.find('.comment-content').text(comment.content);
            }));
        });
    });

    $($comments).on('click', '.js-load-more-comments', function(e) {
        e.preventDefault();
        loadComments();
    });


    /* Close child form */
    $($comments).on('click', '.js-close-reply-form', function(e) {
        e.preventDefault();
        $(this).closest('.comment-replyForm').html('');
    });



    init();

})($);