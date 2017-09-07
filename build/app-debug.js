;(function($) {

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
        editComment: function(id) {
            return $.ajax({
                url: this.api_url + '/' + id,
                type: 'POST',
                dateType: 'json',
                data: {
                    _method: 'PUT'
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

    /*api.getComment(1548).then(function(json) {
        console.log(json);
    });*/

    api.getCommentsList(10).then(function(data) {
        console.log(data);

        data.map(function(comment) {
            var commentElement = createComment($commentTemplate, comment);
            $commentsContainer.append(commentElement);

            if (comment.children.length > 0) {
                var commentChildContainer = commentElement.find('.comment-children');
                comment.children.map(function(child) {
                    commentChildContainer.append(createComment($commentTemplate, child, 'comment--child'));
                });
            }
        });

    });

    function createComment(tpl, comment, className) {
        var template = tpl.clone().attr('id', 'comment-'+comment.id);
        className && template.addClass(className);

        if (comment.author.id !== authorId) {
            template.find('.comment-delete').remove();
            template.find('.comment-edit').remove();
        }

        template.data('id', comment.id);
        template.find('.comment-author').text(comment.author.name);
        template.find('.comment-avatar').css('background-image', 'url('+comment.author.avatar+')');
        template.find('.comment-content').text(comment.content);
        template.find('.comment-posted').text(comment.created_at);
        template.show();
        return template;
    }


    function handleFormSubmit(callback) {
        return function(e) {
            e.preventDefault();
            var elements = e.target.elements;
            var parent_id = +elements['parent'].value;
            var data = {
                content: elements['content'].value,
                parent: parent_id !== 0 ? parent_id : null
            };

            if (data.content.length > 5) {
                api.addComment(data).done(function(response) {
                    callback && callback(response);
                    e.target.reset();
                    console.log(response);
                });
            }
        }
    }


    $('#app_comments_form').on('submit', handleFormSubmit(function(comment) {
        $commentsContainer
            .prepend(createComment($commentTemplate, comment));
    }));


    $($comments).on('click', '.js-show-reply', function(e) {
        e.preventDefault();
        var currentComment = $(this).closest('.comment');
        var replyFormContainer = currentComment.find('.comment-replyForm').first();
        var form = $('#app_comments_form').clone().attr('id', '');
        var cancelBtn = $('<a>').addClass('comment-closeReplyForm js-close-reply-form').text('Cancel');

        form[0].elements['parent'].value = currentComment.data('id');
        form[0].elements['content'].value = '';

        replyFormContainer.append(cancelBtn).append(form);

        form.on('submit', handleFormSubmit(function(comment) {
            cancelBtn.trigger('click');
            currentComment
                .find('.comment-children')
                .first()
                .append(createComment($commentTemplate, comment, 'comment--child'));
        }));
    });

    $($comments).on('click', '.js-close-reply-form', function(e) {
        e.preventDefault();
        $(this).closest('.comment-replyForm').html('');
    });

    $($comments).on('click', '.js-delete-comment', function(e) {
        e.preventDefault();
        var $comment = $(this).closest('.comment');
        var id = $comment.data('id');
        api.deleteComment(id).then(function() {
            if (confirm('Are you sure you want to delete you comment?')) {
                $comment.remove();
            }
        });
    });

    $($comments).on('click', '.js-edit-comment', function(e) {
        e.preventDefault();
        var $comment = $(this).closest('.comment');
        var id = $comment.data('id');
        var form = $('#app_comments_form');

        api.getComment(id).then(function(comment) {
            form[0].elements['id'].value = comment.id;
            form[0].elements['parent'].value = comment.parent;
            form[0].elements['content'].value = comment.content;

            var yOffset = form.offset().top;
            $("body").scrollTop(yOffset);
        });

    });




})($);