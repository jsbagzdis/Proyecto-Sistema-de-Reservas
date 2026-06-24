module.exports = (sequelize, DataTypes) => {
    const Turno = sequelize.define('Turno', {
        hora: {
            type: DataTypes.STRING,
            allowNull: false
        },
        precio: { type: DataTypes.DECIMAL(10, 2), 
            allowNull: false
        }
        }, {
            tableName: 'Turnos',
            indexes: [
                {
                    unique: true,
                    fields: ['hora', 'CanchaId']
                }
            ]
    });
    return Turno;
};