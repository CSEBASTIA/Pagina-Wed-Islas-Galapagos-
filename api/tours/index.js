// POST /api/tours
if (req.method === 'POST') {
    const { title, description, duration, departure, arrival, rating, reviews, image, tags, difficulty } = req.body;

    if (!title) return res.status(400).json({ error: 'title es obligatorio' });

    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || 'Tour');

    // Generar ID único basado en timestamp
    const newId = Date.now();

    const { data, error } = await supabase
        .from('tours')
        .insert([{
            id: newId,
            title,
            description,
            duration,
            departure,
            arrival,
            rating: rating || 5.0,
            reviews: reviews || 0,
            image,
            tags: tagsStr,
            difficulty: difficulty || 'Moderado'
        }])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
        ...data,
        tags: data.tags ? data.tags.split(',').map(x => x.trim()) : []
    });
}