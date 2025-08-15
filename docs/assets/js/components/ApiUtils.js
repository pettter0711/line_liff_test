const getApi = async (root) => {
    let response = await fetch(root);

    try {
        let data = await response.json();
        return data ? data : [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

export { getApi };
