const article = {
    type: "object",
    properties: {
        _id: {
            type: "string",
            pattern: "([0-9a-f]{24})",
        },
        title: {
            type: "string",
        },
        abstract: {
            type: "string",
        },
        content: {
            type: "string",
        },
        image: {
            type: "string",
        },
        yt_link_id: {
            type: "string",
        },
        is_active: {
            type: "boolean",
        },
        author: {
            type: "string",
            $ref: '#/components/schemas/Author'
        },
        created_at: {
            type: "string",
            format: "date-time",
        },
        updated_at: {
            type: "string",
            format: "date-time",
        },
        nb_comments: {
            type: "integer",
        },
    },
};

export { article }

export default {
    type: "object",
    properties: {
        count: {
            type: "integer",
        },
        total_pages: {
            type: "integer",
        },
        page: {
            type: "integer",
        },
        query_params: {
            type: "string",
        },
        data: {
            type: "array",
            items: article,
        },
    },
};
