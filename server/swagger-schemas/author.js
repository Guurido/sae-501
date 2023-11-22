const author = {
    type: "object",
    properties: {
        _id: {
            type: "string",
            pattern: "([0-9a-f]{24})",
        },
        lastname: {
            type: "string",
        },
        firstname: {
            type: "string",
        },
        email: {
            type: "string",
            format: "email"
        },
        bio: {
            type: "string",
        },
        nb_articles: {
            type: "integer",
        },
        color: {
            type: "string",
            pattern: "^#[a-f0-9]{3,6}$"
        },
        image: {
            type: "string",
            format: "binary"
        },
    },
};

const authorCompleted = {
    ...author,
    properties: {
        ...author.properties,
        list_articles: {
            type: "array",
            items: {
                $ref: '#/components/schemas/Article'
            },
        },
        page: {
            type: "integer",
        },
        total_pages: {
            type: "integer",
        },
    }
}

export { authorCompleted as author }

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
            items: author,
        },
    },
};
