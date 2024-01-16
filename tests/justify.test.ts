import * as justify from "../src/justify";
import { expect, test } from "vitest";

test("justify block", () => {
    const text =
        "Labore ex id et laborum itaque. Nihil aspernatur aut officiis quos eveniet ex est. Quis mollitia voluptate optio. Nisi laboriosam nam animi et accusamus. Voluptatem explicabo qui facilis voluptate ut. Ut et dolores quas omnis. Et aut repellendus omnis facilis. Aliquam et rerum placeat quis deleniti saepe sed. Fugiat inventore sapiente nihil cupiditate dolores quia fuga velit. Veniam dolore porro aut ratione sed quis. Debitis voluptatem soluta eius delectus eum sint. Atque illo quae provident rem minus.";
    const sizes = [50, 80, 120];
    const expected = [
        "Labore ex id et laborum itaque.  Nihil  aspernatur\naut officiis quos eveniet ex  est.  Quis  mollitia\nvoluptate optio.  Nisi  laboriosam  nam  animi  et\naccusamus.  Voluptatem   explicabo   qui   facilis\nvoluptate ut. Ut et dolores  quas  omnis.  Et  aut\nrepellendus  omnis  facilis.  Aliquam   et   rerum\nplaceat quis deleniti saepe sed. Fugiat  inventore\nsapiente nihil cupiditate dolores quia fuga velit.\nVeniam dolore porro aut ratione sed quis.  Debitis\nvoluptatem soluta eius delectus  eum  sint.  Atque\nillo quae provident rem minus.",
        "Labore ex id et laborum itaque. Nihil aspernatur aut officiis  quos  eveniet  ex\nest. Quis mollitia voluptate optio. Nisi  laboriosam  nam  animi  et  accusamus.\nVoluptatem explicabo qui facilis voluptate ut. Ut et dolores quas omnis. Et  aut\nrepellendus omnis facilis. Aliquam et rerum placeat  quis  deleniti  saepe  sed.\nFugiat inventore sapiente nihil  cupiditate  dolores  quia  fuga  velit.  Veniam\ndolore porro aut ratione sed quis. Debitis voluptatem soluta eius  delectus  eum\nsint. Atque illo quae provident rem minus.",
        "Labore ex id et laborum itaque. Nihil aspernatur aut officiis quos eveniet ex est. Quis mollitia voluptate  optio.  Nisi\nlaboriosam nam animi et accusamus. Voluptatem explicabo qui facilis voluptate ut. Ut  et  dolores  quas  omnis.  Et  aut\nrepellendus omnis facilis. Aliquam et rerum placeat quis deleniti saepe sed. Fugiat inventore sapiente nihil  cupiditate\ndolores quia fuga velit. Veniam dolore porro aut ratione sed quis. Debitis voluptatem soluta  eius  delectus  eum  sint.\nAtque illo quae provident rem minus.",
    ];
    const l = sizes.length;
    for (let i = 0; i < l; i += 1) {
        const n = sizes[i];
        const result = justify.justifyBlock(text, n);
        expect(result).toBe(expected[i]);
    }
});

test("justify list item", () => {
    const n = 80;
    const original =
        "Est incidunt perferendis sed beatae sint provident culpa. Ducimus ea nemo animi ea et et et. Cumque eos quidem in quia velit vel rerum. Repellendus possimus provident qui veritatis magnam totam.";
    const bullets = ["- ", "* ", "\\item ", "1. ", "1) ", "12. ", "12) "];
    const expected = [
        "- Est incidunt perferendis sed beatae sint  provident  culpa.  Ducimus  ea  nemo\n  animi ea et et et. Cumque eos quidem in  quia  velit  vel  rerum.  Repellendus\n  possimus provident qui veritatis magnam totam.\n",
        "* Est incidunt perferendis sed beatae sint  provident  culpa.  Ducimus  ea  nemo\n  animi ea et et et. Cumque eos quidem in  quia  velit  vel  rerum.  Repellendus\n  possimus provident qui veritatis magnam totam.\n",
        "\\item Est incidunt perferendis sed beatae sint provident culpa. Ducimus ea  nemo\n      animi ea et et et. Cumque eos quidem in quia velit vel rerum.  Repellendus\n      possimus provident qui veritatis magnam totam.\n",
        "1. Est incidunt perferendis sed beatae sint provident  culpa.  Ducimus  ea  nemo\n   animi ea et et et. Cumque eos quidem in quia  velit  vel  rerum.  Repellendus\n   possimus provident qui veritatis magnam totam.\n",
        "1) Est incidunt perferendis sed beatae sint provident  culpa.  Ducimus  ea  nemo\n   animi ea et et et. Cumque eos quidem in quia  velit  vel  rerum.  Repellendus\n   possimus provident qui veritatis magnam totam.\n",
        "12. Est incidunt perferendis sed beatae sint provident culpa.  Ducimus  ea  nemo\n    animi ea et et et. Cumque eos quidem in quia velit  vel  rerum.  Repellendus\n    possimus provident qui veritatis magnam totam.\n",
        "12) Est incidunt perferendis sed beatae sint provident culpa.  Ducimus  ea  nemo\n    animi ea et et et. Cumque eos quidem in quia velit  vel  rerum.  Repellendus\n    possimus provident qui veritatis magnam totam.\n",
    ];

    for (let i = 0; i < bullets.length; i += 1) {
        const item = bullets[i] + original;
        expect(justify.justifyListItem(item, n)).toBe(expected[i]);
    }
});
