const commentArticle = {
    type: "object",
    properties: {
        _id: {
            type: "string",
            pattern: "([0-9a-f]{24})",
        },
        content: {
            type: "string",
        },
        article: {
            type: "string",
            pattern: "([0-9a-f]{24})",
        },
        created_at: {
            type: "string",
            format: "date-time",
        },
        updatedAt: {
            type: "string",
            format: "date-time",
        },
    },
};

export { commentArticle };

export default {
    type: "object",
    properties: {
        _id: {
            type: "string",
            pattern: "([0-9a-f]{24})",
        },
        count: {
            type: "integer",
        },
        total_pages: {
            type: "integer",
        },
        page: {
            type: "integer",
        },
        list_comments: {
            type: "array",
            items: commentArticle,
        },
    },
};
