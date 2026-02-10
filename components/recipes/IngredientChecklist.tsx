"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Ingredient {
	name: string;
	amount?: string;
	unit?: string;
	optional?: boolean;
}

interface IngredientGroup {
	groupName?: string;
	items: Ingredient[];
}

interface IngredientChecklistProps {
	groups: IngredientGroup[];
}

export function IngredientChecklist({ groups }: IngredientChecklistProps) {
	const [checked, setChecked] = useState<Set<string>>(new Set());

	const toggle = (id: string) => {
		setChecked((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const clearAll = () => setChecked(new Set());

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-serif text-xl font-semibold">Ingredients</h2>
				{checked.size > 0 && (
					<Button variant="ghost" size="sm" onClick={clearAll}>
						Clear all
					</Button>
				)}
			</div>
			{groups.map((group) => (
				<div key={group.groupName ?? "default"}>
					{group.groupName && (
						<h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							{group.groupName}
						</h3>
					)}
					<ul className="space-y-2">
						{group.items.map((item) => {
							const id = `${group.groupName ?? ""}-${item.name}`;
							const isChecked = checked.has(id);
							return (
								<li key={id} className="flex items-start gap-3">
									<Checkbox
										id={id}
										checked={isChecked}
										onCheckedChange={() => toggle(id)}
										className="mt-0.5"
									/>
									<label
										htmlFor={id}
										className={cn(
											"cursor-pointer text-sm leading-relaxed",
											isChecked && "text-muted-foreground line-through",
										)}
									>
										{item.amount && (
											<span className="font-medium">
												{item.amount}
												{item.unit ? ` ${item.unit}` : ""}{" "}
											</span>
										)}
										{item.name}
										{item.optional && (
											<span className="ml-1 text-muted-foreground">(optional)</span>
										)}
									</label>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</div>
	);
}
