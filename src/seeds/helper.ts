export const deletedAtGenerator = (f: unknown) =>
	f.weightedRandom([
		{
			value: f.default({ defaultValue: null }),
			weight: 0.9
		},
		{
			value: f.date({
				minDate: new Date(2020, 0, 1),
				maxDate: new Date()
			}),
			weight: 0.1
		}
	]);
