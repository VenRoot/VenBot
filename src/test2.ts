const berechnePrüfziffer = (blz: number, kontoNr: number):number => {
    while(blz >= 97) blz = blz - 97;

    kontoNr = kontoNr * 1000000;
    kontoNr = kontoNr + 131400;

    while(kontoNr >= 88529281) kontoNr = kontoNr - 88529281;
    while(kontoNr >= 97) kontoNr = kontoNr - 97;
    let pruefZiffer = blz * 62 + kontoNr;
    while(pruefZiffer >= 97) pruefZiffer = pruefZiffer - 97;
    pruefZiffer = 98 - pruefZiffer;
    return pruefZiffer;
}


console.log(berechnePrüfziffer(21050170, 425), berechnePrüfziffer(21050170, 12345678));