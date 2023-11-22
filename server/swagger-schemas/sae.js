const sae = {
    type: "object",
    properties: {
        _id: {
            type: "string",
            pattern: "([0-9a-f]{24})",
        },
        title: {
            type: "string",
        },
        content: {
            type: "string",
        },
        image: {
            type: "string",
            format: "binary"
        },
    },
};

export { sae }

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
            items: sae,
        },
    },
};
