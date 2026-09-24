# Recruitment system review

Recruitment owns a persistent, save-backed candidate pool rather than regenerating heroes when the screen mounts. Candidate definitions wrap real `Hero` previews and scouting uncertainty is limited to attributes, signing fees, and weekly salary estimates.

Prospect, standard, veteran, and elite archetypes control age, level, trait count, costs, and estimate uncertainty. Candidate levels use the normal hero-generation and class-weighted attribute-growth pipeline rather than a separate hidden progression stat. Guild reputation gradually increases the chance of elite candidates within the configured cap.

Candidate quality is a public presentation score derived from the hero's current level, trait mix, and attributes. It is descriptive only: there is no hidden hero Potential value or Potential-based XP multiplier.

The recruitment service owns refresh timing and cost, expiration, reservation, scouting payments, rejection, capacity validation, recruitment resolution, history entries, and contract creation. The UI works from the same candidate data used when the hero joins the guild.

Financial presentation initially shows ranges for the upfront fee and weekly salary demand. Scouting narrows financial and attribute uncertainty until Expert scouting reveals exact figures. Contract salary liability and total cost are presented as ranges until those terms become exact. Recruitment affordability intentionally checks only the upfront fee.

The guided recruitment flow uses pulsing controls rather than a separate board tutorial modal: Inspect a candidate, review the dossier tabs, return to the board, Hire, use the guided free refresh, Hire again, then continue into the Campaign.
